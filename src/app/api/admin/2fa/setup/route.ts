
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { authenticator } from '@/lib/otp';
import qrcode from 'qrcode';

// options are already set in lib/otp

export async function POST(req: Request) {
    console.log('2FA Setup POST request received');
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            console.log('Unauthorized session');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Connecting DB...');
        await connectDB();
        console.log('Finding user...');
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            console.log('User not found');
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('User found. Generating secret...');
        // Generate secret
        if (!authenticator) {
            console.error('Authenticator from lib/otp is undefined!');
            throw new Error('Authenticator not initialized');
        }

        let secret;
        try {
            secret = authenticator.generateSecret();
            console.log('Secret generated successfully');
        } catch (e: any) {
            console.error('Error generating secret:', e);
            throw new Error(`Secret generation failed: ${e.message}`);
        }

        // Generate TOTP auth URL
        const service = 'Personal Blog Admin';
        console.log('Generating keyuri...');
        let otpauth;
        try {
            otpauth = authenticator.keyuri(user.email, service, secret);
            console.log('KeyURI generated:', otpauth);
        } catch (e: any) {
            console.error('Error generating keyuri:', e);
            // Fallback manual generation (should be covered by lib but just in case)
            const label = `${encodeURIComponent(service)}:${encodeURIComponent(user.email)}`;
            const params = `secret=${secret}&issuer=${encodeURIComponent(service)}&algorithm=SHA1&digits=6&period=30`;
            otpauth = `otpauth://totp/${label}?${params}`;
            console.log('KeyURI (manual fallback):', otpauth);
        }

        // Generate QR Code
        console.log('Generating QR Code...');
        let qrCodeUrl;
        try {
            qrCodeUrl = await qrcode.toDataURL(otpauth);
            console.log('QR Code generated length:', qrCodeUrl.length);
        } catch (e: any) {
            console.error('Error generating QR code:', e);
            throw new Error(`QR generation failed: ${e.message}`);
        }

        // Save secret
        console.log('Saving user...');
        user.twoFactorSecret = secret;
        await user.save();
        console.log('User saved.');

        return NextResponse.json({
            secret,
            qrCodeUrl
        });

    } catch (error: any) {
        console.error('Error generating 2FA secret [FINAL CATCH]:', error);
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    // Logic to verify and enable
    console.log('2FA Verify (PUT) request received');
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            console.log('Unauthorized session in PUT');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { token } = await req.json();
        if (!token) {
            console.log('Token is missing');
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        console.log('Connecting DB in PUT...');
        await connectDB();
        const user = await User.findOne({ email: session.user.email }).select('+twoFactorSecret');

        if (!user || !user.twoFactorSecret) {
            console.log('User or secret missing in PUT');
            return NextResponse.json({ error: 'Setup 2FA first' }, { status: 400 });
        }

        console.log('Verifying token...');
        console.log('Secret (masked):', user.twoFactorSecret ? user.twoFactorSecret.substring(0, 4) + '***' : 'MISSING');

        let isValid = false;
        try {
            // Debugging: Generate what the server thinks the token should be
            try {
                const expectedToken = authenticator.generate(user.twoFactorSecret);
                console.log(`DEBUG: Received Token: [${token}], Expected Token: [${expectedToken}]`);
            } catch (genErr) {
                console.error('DEBUG: Could not generate expected token for log:', genErr);
            }

            // Check token using the unified async check method
            isValid = await authenticator.check(token, user.twoFactorSecret);
            console.log('Token validation result:', isValid);
        } catch (e: any) {
            console.log('Error during token check:', e);
        }

        if (!isValid) {
            console.log('Invalid token provided');
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
        }

        user.isTwoFactorEnabled = true;

        // Generate backup codes
        console.log('Generating backup codes...');
        const backupCodes = Array.from({ length: 10 }, () => authenticator.generateSecret().slice(0, 10));
        user.twoFactorBackupCodes = backupCodes; // You might want to hash these

        await user.save();
        console.log('2FA enabled successfully.');

        return NextResponse.json({ success: true, backupCodes });

    } catch (error: any) {
        console.error('Error verifying 2FA [FINAL CATCH]:', error);
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    // Disable 2FA
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.twoFactorBackupCodes = undefined;
        await user.save();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error disabling 2FA:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

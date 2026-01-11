import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Generate 6-digit verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save code to user
        await User.findByIdAndUpdate(userId, {
            verificationCode,
            verificationCodeExpiry
        });

        // Send email
        const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
        const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

        if (!emailUser || !emailPass) {
            throw new Error('Email credentials missing');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const mailOptions = {
            from: emailUser,
            to: user.email,
            subject: 'Password Change Verification Code',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f766e;">Password Change Verification</h2>
          <p>Hello ${user.name},</p>
          <p>A password change request was initiated for your account by an administrator.</p>
          <p>Please provide the following code to the administrator to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #f3f4f6; padding: 12px 24px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
              ${verificationCode}
            </span>
          </div>
          <p style="color: #666; font-size: 14px;">
            This code is valid for 15 minutes.
          </p>
        </div>
      `
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            message: 'Verification code sent to user email'
        });

    } catch (error) {
        console.error('Error sending verification code:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send verification code' },
            { status: 500 }
        );
    }
}

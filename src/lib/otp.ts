
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';

export interface OTPAuthenticator {
    generateSecret(): string;
    check(token: string, secret: string): Promise<boolean>;
    verify(options: { token: string; secret: string }): Promise<boolean>;
    keyuri(user: string, service: string, secret: string): string;
    generate(secret: string): Promise<string>;
}

// Reusable plugins
const cryptoPlugin = new NobleCryptoPlugin();
const base32Plugin = new ScureBase32Plugin();

// Base config for generation (not for verification loop)
const baseAuthenticator = new TOTP({
    step: 30,
    digits: 6,
    crypto: cryptoPlugin,
    base32: base32Plugin
} as any);

const authenticator: OTPAuthenticator = {
    generateSecret: () => {
        return baseAuthenticator.generateSecret();
    },

    // Robust manual check using epoch validation to bypass library verification issues
    check: async (token: string, secret: string) => {
        try {
            if (!token || !secret) return false;

            // Sanitize token
            const cleanToken = String(token).replace(/\D/g, '');

            const now = Date.now();
            const step = 30;
            const window = 2; // +/- 2 steps (approx 1 min tolerance)

            // Check current, previous, and next windows
            for (let i = -window; i <= window; i++) {
                const epoch = now + (i * step * 1000);

                // Instantiate a lightweight validator for this specific time
                const validator = new TOTP({
                    step,
                    digits: 6,
                    crypto: cryptoPlugin,
                    base32: base32Plugin,
                    epoch
                } as any);

                try {
                    // Generate token for this window
                    const generated = await (validator as any).generate({ secret });
                    if (generated === cleanToken) {
                        return true;
                    }
                } catch (e) {
                    // Ignore generation errors for specific windows
                }
            }

            return false;
        } catch (error) {
            console.error('OTP check error:', error);
            return false;
        }
    },

    // Map verify to check for consistency
    verify: async (options) => {
        return authenticator.check(options.token, options.secret);
    },

    // Legacy keyuri method -> toURI
    keyuri: (user: string, service: string, secret: string) => {
        const label = `${service}:${user}`;
        return baseAuthenticator.toURI({
            secret,
            label,
            issuer: service
        });
    },

    // Expose generate directly (corrected signature)
    generate: async (secret: string) => {
        return await (baseAuthenticator as any).generate({ secret });
    }
};

export { authenticator };

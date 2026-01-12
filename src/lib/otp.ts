
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
    window: 2,
    crypto: cryptoPlugin,
    base32: base32Plugin
} as any);

const authenticator: OTPAuthenticator = {
    generateSecret: () => {
        return baseAuthenticator.generateSecret();
    },

    // Use standard library check which handles windowing correctly
    check: async (token: string, secret: string) => {
        try {
            if (!token || !secret) return false;
            // Clean token of any non-numeric characters
            const cleanToken = String(token).replace(/\D/g, '');
            const isValid = (baseAuthenticator as any).verify({ token: cleanToken, secret });
            return !!isValid;
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

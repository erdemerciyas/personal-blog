
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';

// Define the shape of our compatible authenticator
export interface OTPAuthenticator {
    generateSecret(): string;
    check(token: string, secret: string): Promise<boolean>;
    verify(options: { token: string; secret: string }): Promise<boolean>;
    keyuri(user: string, service: string, secret: string): string;
}

// Create the underlying instance with required plugins
// 'any' cast is used because the exact typing of TOTP constructor might vary between versions/installs
// but at runtime we know these plugins are required.
const baseAuthenticator = new TOTP({
    step: 30,
    window: 1,
    digits: 6,
    crypto: new NobleCryptoPlugin(),
    base32: new ScureBase32Plugin()
} as any);

// Create a wrapper to provide backward compatibility and handle new object-based API
const authenticator: OTPAuthenticator = {
    generateSecret: () => {
        return baseAuthenticator.generateSecret();
    },

    // Legacy check method -> async verify
    check: async (token: string, secret: string) => {
        try {
            // Force boolean return and bypass type checks for argument structure
            // verifying against runtime behavior that expects object or similar
            const result = await (baseAuthenticator.verify as any)({ token, secret });
            return !!result;
        } catch (error) {
            console.error('OTP check error:', error);
            return false;
        }
    },

    // Expose verify directly for newer usages
    verify: async (options) => {
        const result = await (baseAuthenticator.verify as any)(options);
        return !!result;
    },

    // Legacy keyuri method -> toURI
    keyuri: (user: string, service: string, secret: string) => {
        // Construct label as standard "Issuer:Account"
        const label = `${service}:${user}`;
        return baseAuthenticator.toURI({
            secret,
            label,
            issuer: service
        });
    }
};

export { authenticator };

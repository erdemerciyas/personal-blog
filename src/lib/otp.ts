
import { TOTP } from 'otplib';

let authenticator: TOTP | any;

try {
    // Standard TOTP configuration
    // In Node.js environment, otplib uses the built-in crypto module automatically
    authenticator = new TOTP({
        step: 30,
        window: 1,
        digits: 6
    } as any);

} catch (e) {
    console.error('Failed to initialize OTP authenticator:', e);
}

// Fallback if something failed completely
if (!authenticator) {
    console.error('CRITICAL: Authenticator could not be initialized.');
    authenticator = {
        generateSecret: () => { throw new Error('Authenticator not initialized'); },
        keyuri: () => { throw new Error('Authenticator not initialized'); },
        check: () => { throw new Error('Authenticator not initialized'); },
        verify: () => { throw new Error('Authenticator not initialized'); },
        options: {}
    };
}

export { authenticator };

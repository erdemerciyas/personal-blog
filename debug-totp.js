
const otplib = require('otplib');
console.log('generateSecret:', otplib.generateSecret ? otplib.generateSecret() : 'missing');

try {
    const { TOTP } = otplib;
    const totp = new TOTP({
        step: 30,
        window: 1
    });
    console.log('TOTP instance created');

    // Check if we can set crypto
    // In v12+, crypt is usually a plugin or passed in options?
    console.log('check crypto:', totp.check('123456', 'SECRET'));
} catch (e) {
    console.error('TOTP error:', e.message);
}

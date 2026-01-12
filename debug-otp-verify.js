
const otplib = require('otplib');
const { TOTP } = otplib;

if (TOTP) {
    try {
        const instance = new TOTP({
            step: 30,
            window: 1
        });

        const secret = instance.generateSecret();
        const token = instance.generate(secret);

        console.log('generated token:', token);

        // Test verify
        try {
            const isValid = instance.verify({ token, secret });
            console.log('verify({ token, secret }) result:', isValid);
        } catch (e) {
            console.log('verify({ token, secret }) failed:', e.message);
        }

        // Test check (expecting fail)
        if (instance.check) {
            console.log('check exists');
        } else {
            console.log('check DOES NOT exist');
        }

        // Test keyuri / toURI
        /*
          According to docs, keyuri is a static method usually, or part of Authenticator.
          TOTP class likely has methods that work differently.
          If check doesn't exist, we must use verify.
        */

    } catch (e) {
        console.error('Error:', e);
    }
}

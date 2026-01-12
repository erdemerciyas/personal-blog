
try {
    const otplib = require('otplib');
    const { TOTP, ScureBase32Plugin, NobleCryptoPlugin } = otplib;

    // Looks like v13 exports classes directly, NO default authenticator instance?
    // We must instantiate it myself.

    const options = {
        step: 30,
        window: 1,
        digits: 6
    };

    // Add base32 plugin - MANDATORY
    if (ScureBase32Plugin) {
        options.base32 = new ScureBase32Plugin();
    }

    // Add crypto plugin - MANDATORY for Node?
    if (NobleCryptoPlugin) {
        options.crypto = new NobleCryptoPlugin();
    }

    const authenticator = new TOTP(options);
    console.log('Authenticator created successfully');
    console.log('Secret:', authenticator.generateSecret());

} catch (e) {
    console.error('Error:', e);
}

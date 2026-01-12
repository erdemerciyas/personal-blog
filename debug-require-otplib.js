
try {
    const otplib = require('otplib');
    console.log('Keys:', Object.keys(otplib));
    console.log('Has authenticator:', !!otplib.authenticator);
    console.log('Has default:', !!otplib.default);
    if (otplib.default) {
        console.log('Default keys:', Object.keys(otplib.default));
        console.log('Default has authenticator:', !!otplib.default.authenticator);
    }
} catch (e) {
    console.error(e);
}

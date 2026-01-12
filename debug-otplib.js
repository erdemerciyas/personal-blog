
const otplib = require('otplib');
console.log('otplib type:', typeof otplib);
console.log('otplib keys:', Object.keys(otplib));
console.log('otplib.authenticator:', otplib.authenticator);
console.log('otplib.default:', otplib.default);
if (otplib.default) {
    console.log('otplib.default keys:', Object.keys(otplib.default));
    console.log('otplib.default.authenticator:', otplib.default.authenticator);
}

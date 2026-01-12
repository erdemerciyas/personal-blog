
const otplib = require('otplib');
const { TOTP } = otplib;
console.log('TOTP available:', !!TOTP);

if (TOTP) {
    try {
        const instance = new TOTP({
            step: 30,
            window: 1
        });
        console.log('Instance created');
        console.log('instance.generateSecret:', typeof instance.generateSecret);
        console.log('instance.keyuri:', typeof instance.keyuri);
        console.log('instance.check:', typeof instance.check);

        if (instance.generateSecret) {
            console.log('Secret:', instance.generateSecret());
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

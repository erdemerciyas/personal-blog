
const otplib = require('otplib');
const { TOTP } = otplib;

if (TOTP) {
    try {
        const instance = new TOTP({
            step: 30,
            window: 1
        });
        console.log('Methods on TOTP instance:');

        let obj = instance;
        let props = [];

        do {
            props = props.concat(Object.getOwnPropertyNames(obj));
        } while (obj = Object.getPrototypeOf(obj));

        console.log(props.sort().filter((e, i, a) => e !== a[i - 1])); // unique

    } catch (e) {
        console.error('Error:', e);
    }
} else {
    console.log('TOTP class not found in otplib');
}

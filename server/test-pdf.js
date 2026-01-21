const pdfParseLib = require('pdf-parse');
console.log('Lib type:', typeof pdfParseLib);
console.log('Lib keys:', Object.keys(pdfParseLib));

async function test() {
    try {
        const buffer = Buffer.from("test");
        let result;

        if (typeof pdfParseLib === 'function') {
            console.log("Calling direct...");
            result = await pdfParseLib(buffer);
        } else if (pdfParseLib.default && typeof pdfParseLib.default === 'function') {
            console.log("Calling .default...");
            result = await pdfParseLib.default(buffer);
        } else {
            console.log("No callable entry found.");
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
test();

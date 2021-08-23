const lambdaLocal = require('lambda-local');
const path = require("path");

const regex = /test/;

const jsonPayload = {
    test: "test"
}

const main = async () => {
    try {
        const response = await lambdaLocal.execute({
            event: jsonPayload,
            lambdaPath: path.join(__dirname.replace(regex, ""), 'index.js'),
            timeoutMs: 3000
        })
        console.log("response", response);
    } catch (error) {
        console.log("error", error);
    }
}

main();
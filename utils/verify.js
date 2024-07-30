const { run } = require("hardhat");

async function verify(contractaddress, args) {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractaddress,
            constructorArguments: args,
        });
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!");
        } else {
            console.log(`Get error: ${e}`);
        }
    }
}

module.exports = {
    verify,
};

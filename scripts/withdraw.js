const { getNamedAccounts, ethers, deployments } = require("hardhat");

async function main() {
    const signer = await ethers.provider.getSigner();
    const fundMeDeployment = await deployments.get("FundMe");
    const fundMe = await ethers.getContractAt(
        fundMeDeployment.abi,
        fundMeDeployment.address,
        signer,
    );
    console.log("Funding...");
    const transactionResponse = await fundMe.withdraw();
    await transactionResponse.wait(1);
    console.log("Got it back!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });

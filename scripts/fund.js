const { getNamedAccounts, ethers, deployments } = require("hardhat");

async function main() {
    const signer = await ethers.provider.getSigner();
    const fundMeDeployment = await deployments.get("FundMe");
    const fundMe = await ethers.getContractAt(
        fundMeDeployment.abi,
        fundMeDeployment.address,
        signer,
    );
    console.log("Funding Contract...");
    const transactionResponse = await fundMe.fund({
        value: ethers.parseEther("0.1"),
    });
    await transactionResponse.wait(1);
    console.log("Funded!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });

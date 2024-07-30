require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");
require("solidity-coverage");
require("hardhat-deploy");

module.exports = {
    // solidity: "0.8.26",
    solidity: {
        compilers: [{ version: "0.8.26" }, { version: "0.8.0" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 5,
        },
    },
    gasReporter: {
        enabled: true,
        noColors: true,
        L1: "ethereum",
        L2: "arbitrum",
        L1Etherscan: process.env.ETHERSCAN_API_KEY,
        outputFile: "gas-report.txt",
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
        user: {
            default: 1,
        },
    },
};

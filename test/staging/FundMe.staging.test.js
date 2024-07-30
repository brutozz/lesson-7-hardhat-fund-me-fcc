const { developmentChains } = require("../../helper-hardhat-config");
const { ethers, getNamedAccounts, deployments, network } = require("hardhat");
const { assert } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe;
          let deployer;
          let sendValue = ethers.parseEther("1");

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              const fundMeDeployment = await deployments.get("FundMe");
              fundMe = await ethers.getContractAt(
                  fundMeDeployment.abi,
                  fundMeDeployment.address,
                  deployer,
              );
          });
          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const endingBalance = await ethers.provider.getBalance(
                  await fundMe.getAddress(),
              );
              assert.equal(endingBalance.toString(), "0");
          });
      });

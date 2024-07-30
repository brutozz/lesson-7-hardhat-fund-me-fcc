const { assert, expect } = require("chai");
const { deployments, getNamedAccounts, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe;
          let mockV3Aggregator;
          let deployer;
          const sendValue = ethers.parseEther("1");
          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["all"]);

              const fundMeDeployment = await deployments.get("FundMe");
              const mockV3AggregatorDeployment =
                  await deployments.get("MockV3Aggregator");
              fundMe = await ethers.getContractAt(
                  fundMeDeployment.abi,
                  fundMeDeployment.address,
                  deployer,
              );
              mockV3Aggregator = await ethers.getContractAt(
                  mockV3AggregatorDeployment.abi,
                  mockV3AggregatorDeployment.address,
                  deployer,
              );
          });
          describe("constructor", async () => {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.target);
              });
          });
          describe("fund", async () => {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough!",
                  );
              });
              it("updated the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue });
                  const response =
                      await fundMe.getAddressToAmountFunded(deployer);
                  assert.equal(response.toString(), sendValue.toString());
              });
              it("Add funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getFunder(0);
                  assert.equal(response, deployer.address);
              });
          });
          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });
              it("withdraw ETH form a single founder", async () => {
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress(),
                      );
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const transactionResponse = await fundMe.withdraw();
                  const trasactionReceipt = await transactionResponse.wait(1);
                  const gasCost =
                      trasactionReceipt.gasPrice * trasactionReceipt.gasUsed;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      await fundMe.getAddress(),
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost,
                  );
              });

              it("cheaper withdraw ETH form a single founder", async () => {
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress(),
                      );
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const trasactionReceipt = await transactionResponse.wait(1);
                  const gasCost =
                      trasactionReceipt.gasPrice * trasactionReceipt.gasUsed;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      await fundMe.getAddress(),
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost,
                  );
              });

              it("allows us to cheaper withdraw multiple funders", async () => {
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress(),
                      );
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const trasactionReceipt = await transactionResponse.wait(1);
                  const gasCost =
                      trasactionReceipt.gasPrice * trasactionReceipt.gasUsed;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      await fundMe.getAddress(),
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost,
                  );
              });

              it("allows us to withdraw multiple funders", async () => {
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress(),
                      );
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const transactionResponse = await fundMe.withdraw();
                  const trasactionReceipt = await transactionResponse.wait(1);
                  const gasCost =
                      trasactionReceipt.gasPrice * trasactionReceipt.gasUsed;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      await fundMe.getAddress(),
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost,
                  );

                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address,
                          ),
                          0,
                      );
                  }
              });
              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];

                  const attackerConnectedContract =
                      await fundMe.connect(attacker);
                  await expect(
                      attackerConnectedContract.withdraw(),
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });
          });
      });

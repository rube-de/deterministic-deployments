// deploy script
import { ethers, defender } from "hardhat";


async function main() {
  const ContractFactory = await ethers.getContractFactory("contracts/LockCreate3.sol:Lock3");

  const deployApprovalProcess = await defender.getDeployApprovalProcess();

  if (deployApprovalProcess.address === undefined) {
    throw new Error(`Deploy approval process with id ${deployApprovalProcess.approvalProcessId} has no assigned address`);
  }

  // const deployment = await defender.deployProxy(Box, [5, upgradeApprovalProcess.address], { initializer: "initialize" });
  const currentTimestampInSeconds = Math.round(Date.now() / 1000); 
  const unlockTime = currentTimestampInSeconds + 60;
  const ownerAddr = deployApprovalProcess.address;

  const options = {
    verifySourceCode: true,
    salt: "test202"
  }
  console.log("deploy..")
  const deployment = await defender.deployContract(ContractFactory, [unlockTime,ownerAddr], options);
  // const deployment = await defender.deployProxy(ContractFactory, {salt: "201",});

  await deployment.waitForDeployment();

  console.log(`Contract deployed to ${await deployment.getAddress()}`);

  // verification
  // await defender.verifyDeployment(await deployment.getAddress(), )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
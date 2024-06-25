import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction, DeployResult} from 'hardhat-deploy/types';

import { preDeploy } from "../utils/contracts";
import { verifyContract } from "../utils/verify";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getChainId, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const chainId = await getChainId();

  const {deployer} = await getNamedAccounts();

  const currentTimestampInSeconds = Math.round(Date.now() / 1000); 
  // const unlockTime = currentTimestampInSeconds + 60;
  const unlockTime = 1721827674; // constrcutor args have to be constant for deterministic deployment
  const ownerAddr = deployer;

  await preDeploy(deployer, "Lock_deterministic");
  const deployResult: DeployResult = await deploy('Lock_deterministic', {
    contract: "contracts/LockCreate3.sol:Lock3",
    from: deployer,
    args: [
      unlockTime,
      ownerAddr
    ],
    log: true,
    deterministicDeployment: true,
  });


  // You don't want to verify on localhost
  if (chainId !== "31337" && chainId !== "1337") {
    const contractPath = `contracts/LockCreate3.sol:Lock`;
    await verifyContract({
      contractPath: contractPath,
      contractAddress: deployResult.address,
      args: deployResult.args || [],
    });
  }
};
export default func;
func.tags = ['Lock_deterministic'];
func.id = 'deploy_lock_deterministic';
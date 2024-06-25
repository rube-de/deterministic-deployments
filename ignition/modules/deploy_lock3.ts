import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const JAN_1ST_2030 = 1893456000;
const ONE_GWEI: bigint = 1_000_000_000n;

const LockModule = buildModule("LockModule", (m) => {

  // like hardhat-deploy getNamedAccounts()
  const deployer = m.getAccount(0);


  const unlockTime = m.getParameter("unlockTime", JAN_1ST_2030);

  const lock1 = m.contract("Lock3", [unlockTime, deployer], {
    from: deployer,
  });

  return { lock1 };
});

export default LockModule;

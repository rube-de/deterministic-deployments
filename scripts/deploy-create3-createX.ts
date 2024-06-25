import { Wallet, getDefaultProvider, ethers, AbiCoder, Interface } from 'ethers';
import Lock3 from '../artifacts/contracts/LockCreate3.sol/Lock3.json';
import CreateX from './CreateX.json'
import {NETWORKS,Network} from '../config/networks';

const CREATE_3_DEPLOYER = '0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed';

async function main() {
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error('Invalid private key. Make sure the PRIVATE_KEY environment variable is set.');
    }

    const currentTimestampInSeconds = Math.round(Date.now() / 1000); 
    const unlockTime = currentTimestampInSeconds + 60;
    const evmChains = getEvmChains();

    const eventABI = ["event ContractCreation(address indexed newContract)"];
    const iface = new Interface(eventABI);

    for (const chain of evmChains) {
        const wallet = new Wallet(privateKey);
        const provider = getDefaultProvider(chain.url);
        const connectedWallet = wallet.connect(provider);
        const deployerContract = new ethers.Contract(CREATE_3_DEPLOYER, CreateX.abi, connectedWallet);
        const coder = AbiCoder.defaultAbiCoder()

        // Convert sender address to bytes (20 bytes)
        const senderBytes = ethers.getBytes(wallet.address);
        // console.log("senderbytes: ", senderBytes);
        
        // Create the cross-chain protection byte
        const crossChainProtection = false;
        const protectionByte = crossChainProtection ? new Uint8Array([0x01]) : new Uint8Array([0x00]);
        
        // Generate 11 bytes for entropy
        const entropyBytes = ethers.toUtf8Bytes("test123".padStart(11, '\0').slice(0, 11));
        
        // Concatenate all parts
        const saltBytes = ethers.concat([senderBytes, protectionByte, entropyBytes]);
        // console.log("saltbytes: ", saltBytes);


        const creationCode = ethers.solidityPacked( ['bytes', 'bytes'], [Lock3.bytecode, coder.encode(['uint256', 'address'], [unlockTime+chain.chainId, wallet.address])] ); 
        const predictionAddress = await deployerContract['computeCreate3Address(bytes32,address)'](saltBytes, wallet.address);
        console.log(`${chain.chainId}, prediciton2 address: ${predictionAddress}`);
        const deployedAddress = await deployerContract['deployCreate3(bytes32,bytes)'](saltBytes, creationCode);
        const receipt = await deployedAddress.wait();
        receipt.logs.forEach((log) => {
            const parsedLog = iface.parseLog(log);
            if (parsedLog) console.log(`${chain.chainId}, deployed address: ${parsedLog!.args.newContract}`);
        });
    }
}
function getEvmChains() {
    const chains: Network[] = [];
    // chains.push(NETWORKS.sepolia);
    // chains.push(NETWORKS['polygon-mainnet']);
    chains.push(NETWORKS['polygon-amoy']);
    return chains;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
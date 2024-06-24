import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(process.cwd(), dotenvConfigPath) });

const INFURA_KEY = process.env.INFURA_API_KEY;
if (typeof INFURA_KEY === "undefined") {
  console.log(`INFURA_API_KEY must be a defined environment variable`);
}

const infuraUrl = (network: string): string => `https://${network}.infura.io/v3/${INFURA_KEY}`;

/**
 * All supported network names
 * To use a network in your command use the value of each key
 *
 * e.g.
 *
 * $ yarn deploy:network mainnet
 *
 * $ npx hardhat run scripts/deploy.ts --network polygon-mainnet
 */
export enum NetworkName {
  // ETHEREUM
  MAINNET = "mainnet",
  SEPOLIA = "sepolia",

  // POLYGON
  POLYGON_MAINNET = "polygon-mainnet",
  POLYGON_MUMBAI = "polygon-mumbai",
  POLYGON_AMOY = "polygon-amoy",

  // OPTIMISM
  OPTIMISM_MAINNET = "optimism-mainnet",
  OPTIMISM_GOERLI = "optimism-goerli",

  // ARBITRUM
  ARBITRUM_MAINNET = "arbitrum-mainnet",
  ARBITRUM_GOERLI = "arbitrum-goerli",
}

export interface Network {
  chainId: number;
  url: string;
}

export const NETWORKS: { readonly [key in NetworkName]: Network } = {
  // ETHEREUM
  [NetworkName.MAINNET]: {
    chainId: 1,
    url: infuraUrl("mainnet"),
  },
  [NetworkName.SEPOLIA]: {
    chainId: 11_155_111,
    url: infuraUrl("sepolia"),
  },

  // MATIC/POLYGON
  [NetworkName.POLYGON_MAINNET]: {
    chainId: 137,
    url: infuraUrl("polygon-mainnet"),
  },
  [NetworkName.POLYGON_MUMBAI]: {
    chainId: 80_001,
    url: infuraUrl("polygon-mumbai"),
  },
  [NetworkName.POLYGON_AMOY]: {
    chainId: 80_002,
    url: infuraUrl("polygon-amoy"),
  },

  // OPTIMISM
  [NetworkName.OPTIMISM_MAINNET]: {
    chainId: 10,
    url: infuraUrl("optimism-mainnet"),
  },
  [NetworkName.OPTIMISM_GOERLI]: {
    chainId: 420,
    url: infuraUrl("optimism-goerli"),
  },

  // ARBITRUM
  [NetworkName.ARBITRUM_MAINNET]: {
    chainId: 42_161,
    url: infuraUrl("arbitrum-mainnet"),
  },
  [NetworkName.ARBITRUM_GOERLI]: {
    chainId: 421_611,
    url: infuraUrl("arbitrum-goerli"),
  },
} as const;

export const DEVELOPMENT_CHAINS: string[] = ["hardhat", "localhost", "ganache"];

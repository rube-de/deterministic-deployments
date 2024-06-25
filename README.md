## Getting Started

### install dependencies

```sh
$ make setup # install Forge and Node.js deps
```

or

```sh
$ yarn install
$ forge install
```
### create env

Needed: 
private key, infura api-key and etherscan api key

# Deterministic Deployments

## Axelar

### With create2

```
yarn hardhat run scripts/deploy-create2-deployer.ts
```

### With create3
```
yarn hardhat run scripts/deploy-create3-axelar.ts
```


## ZeframLou

```
yarn hardhat run scripts/deploy-create3-zeframlou.ts
```

## OpenzeppelinDefender

```
yarn hardhat run scripts/deploy-create2-defender.ts --network sepolia
```

## Hardhat-deploy

```
yarn hardhat deploy --network sepolia --tags Lock_deterministic
```

## Hardhat-ignition

### strategy create2

```
yarn hardhat ignition deploy ignition/modules/deploy_lock3.ts --network sepolia --strategy create2 --verify
```

### strategy create3

waiting for https://github.com/NomicFoundation/hardhat-ignition/issues/726

## CreateX

### Create3

```
yarn hardhat run scripts/deploy-create3-createX.ts
```
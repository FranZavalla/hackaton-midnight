/*
 * This file is the main driver for the Midnight bulletin board example.
 * The entry point is the run function, at the end of the file.
 * We expect the startup files (testnet-remote.ts, standalone.ts, etc.) to
 * call run with some specific configuration that sets the network addresses
 * of the servers this file relies on.
 */

import { createInterface, type Interface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { WebSocket } from "ws";
import { webcrypto } from "crypto";
import {
  type BalancedTransaction,
  createBalancedTx,
  type MidnightProvider,
  type UnbalancedTransaction,
  type WalletProvider,
} from "@midnight-ntwrk/midnight-js-types";
import { type Wallet } from "@midnight-ntwrk/wallet-api";
import * as Rx from "rxjs";
import {
  type CoinInfo,
  nativeToken,
  Transaction,
  type TransactionId,
} from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { type Resource, WalletBuilder } from "@midnight-ntwrk/wallet";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { type Logger } from "pino";
import type {
  StartedDockerComposeEnvironment,
  DockerComposeEnvironment,
} from "testcontainers";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { type ContractAddress } from "@midnight-ntwrk/compact-runtime";
import { toHex } from "@midnight-ntwrk/midnight-js-utils";
import {
  getLedgerNetworkId,
  getZswapNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import {
  BallotDerivedState,
  BallotProviders,
  DeployedBallotContract,
  PrivateStates,
} from "../types";
import { ledger, Ledger } from "../contract/managed/ballot/contract/index.cjs";
import { Config, StandaloneConfig } from "../config";
import { BallotApi } from "../api";
import { randomBytes } from "node:crypto";

// @ts-expect-error: It's needed to make Scala.js and WASM code able to use cryptography
globalThis.crypto = webcrypto;

// @ts-expect-error: It's needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

/* **********************************************************************
 * getBBoardLedgerState: a helper that queries the current state of
 * the data on the ledger, for a specific bulletin board contract.
 * Note that the Ledger type returned here is not some generic,
 * abstract ledger object, but specifically the type generated by
 * the Compact compiler to correspond to the ledger declaration
 * in the bulletin board contract.
 */

export const getBallotLedgerState = (
  providers: BallotProviders,
  contractAddress: ContractAddress
): Promise<Ledger | null> =>
  providers.publicDataProvider
    .queryContractState(contractAddress)
    .then((contractState) =>
      contractState != null ? ledger(contractState.data) : null
    );

const DEPLOY_OR_JOIN_QUESTION = `
    You can do one of the following:
      1. Deploy a new ballot contract
      2. Join an existing ballot contract
      3. Exit
    Which would you like to do? `;
const deployOrJoin = async (
  providers: BallotProviders,
  rli: Interface,
  logger: Logger
): Promise<BallotApi | null> => {
  let api: BallotApi | null = null;

  while (true) {
    const choice = await rli.question(DEPLOY_OR_JOIN_QUESTION);
    switch (choice) {
      case "1":
        api = await BallotApi.deploy(providers, logger);
        logger.info(
          `Deployed contract at address: ${api.deployedContractAddress}`
        );
        return api;
      case "2":
        api = await BallotApi.join(
          providers,
          await rli.question("What is the contract address (in hex)? "),
          logger
        );
        logger.info(
          `Joined contract at address: ${api.deployedContractAddress}`
        );
        return api;
      case "3":
        logger.info("Exiting...");
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const displayLedgerState = async (
  providers: BallotProviders,
  deployedBallotContract: DeployedBallotContract,
  logger: Logger
): Promise<void> => {
  const contractAddress =
    deployedBallotContract.deployTxData.public.contractAddress;
  const ledgerState = await getBallotLedgerState(providers, contractAddress);
  if (ledgerState === null) {
    logger.info(`There is no ballot contract deployed at ${contractAddress}`);
  } else {
    logger.info(`Current ledger state:`);
    console.dir(ledgerState, { depth: null });
  }
};

const displayPrivateState = async (
  providers: BallotProviders,
  logger: Logger
): Promise<void> => {
  const privateState =
    await providers.privateStateProvider.get("ballotPrivateState");
  if (privateState === null) {
    logger.info(`There is no existing bulletin board private state`);
  } else {
    logger.info(`Current secret key is: ${toHex(privateState.secret_key)}`);
  }
};

const displayDerivedState =
  (ledgerState: BallotDerivedState | undefined, logger: Logger) => {
    if (ledgerState === undefined) {
      logger.info(`No bulletin board state currently available`);
    } else {
      logger.info(`Current derived state:`);
      console.dir(ledgerState, { depth: null });
    }
  };


const MAIN_LOOP_QUESTION = `
You can do one of the following:
  1. Vote
  2. Display the current ledger state (known by everyone)
  3. Display the current private state (known only to this DApp instance)
  4. Display the derived state (known by everyone)
  5. Exit
Which would you like to do? `;

const mainLoop = async (
  providers: BallotProviders,
  rli: Interface,
  logger: Logger
): Promise<void> => {
  const ballotApi = await deployOrJoin(providers, rli, logger);
  if (ballotApi === null) {
    return;
  }
  let currentState: BallotDerivedState | undefined;
  const stateObserver = {
    next: (state: BallotDerivedState) => (currentState = state),
  };
  const subscription = ballotApi.state$.subscribe(stateObserver);
  try {
    while (true) {
      const choice = await rli.question(MAIN_LOOP_QUESTION);
      switch (choice) {
        case "1": {
          const candidate = await rli.question(`Who do you want to vote for?`);
          await ballotApi.vote(candidate);
          break;
        }
        case "2":
          await displayLedgerState(
            providers,
            ballotApi.deployedContract,
            logger
          );
          break;
        case "3":
          await displayPrivateState(providers, logger);
          break;
        case "4":
          displayDerivedState(currentState, logger);
          break;
        case "5":
          logger.info("Exiting...");
          return;
        default:
          logger.error(`Invalid choice: ${choice}`);
      }
    }
  } finally {
    // While we allow errors to bubble up to the 'run' function, we will always need to dispose of the state
    // subscription when we exit.
    subscription.unsubscribe();
  }
};

export const createWalletAndMidnightProvider = async (
  wallet: Wallet
): Promise<WalletProvider & MidnightProvider> => {
  const state = await Rx.firstValueFrom(wallet.state());
  return {
    coinPublicKey: state.coinPublicKey,
    balanceTx(
      tx: UnbalancedTransaction,
      newCoins: CoinInfo[]
    ): Promise<BalancedTransaction> {
      return wallet
        .balanceTransaction(
          ZswapTransaction.deserialize(
            tx.serialize(getLedgerNetworkId()),
            getZswapNetworkId()
          ),
          newCoins
        )
        .then((tx) => wallet.proveTransaction(tx))
        .then((zswapTx) =>
          Transaction.deserialize(
            zswapTx.serialize(getZswapNetworkId()),
            getLedgerNetworkId()
          )
        )
        .then(createBalancedTx);
    },
    submitTx(tx: BalancedTransaction): Promise<TransactionId> {
      return wallet.submitTransaction(tx);
    },
  };
};

const waitForFunds = (wallet: Wallet, logger: Logger) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.tap((state) => {
        const scanned = state.syncProgress?.synced ?? 0n;
        const total = state.syncProgress?.total.toString() ?? "unknown number";
        logger.info(`Wallet processed ${scanned} indices out of ${total}`);
      }),
      Rx.filter((state) => {
        // Let's allow progress only if wallet is close enough
        const synced = state.syncProgress?.synced ?? 0n;
        const total = state.syncProgress?.total ?? 1_000n;
        return total - synced < 100n;
      }),
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),
      Rx.filter((balance) => balance > 0n)
    )
  );

const buildWalletAndWaitForFunds = async (
  { indexer, indexerWS, node, proofServer }: Config,
  logger: Logger,
  seed: string
): Promise<Wallet & Resource> => {
  const wallet = await WalletBuilder.buildFromSeed(
    indexer,
    indexerWS,
    proofServer,
    node,
    seed,
    getZswapNetworkId(),
    "warn"
  );
  wallet.start();
  const state = await Rx.firstValueFrom(wallet.state());
  logger.info(`Your wallet seed is: ${seed}`);
  logger.info(`Your wallet address is: ${state.address}`);
  let balance = state.balances[nativeToken()];
  if (balance === undefined || balance === 0n) {
    logger.info(`Your wallet balance is: 0`);
    logger.info(`Waiting to receive tokens...`);
    balance = await waitForFunds(wallet, logger);
  }
  logger.info(`Your wallet balance is: ${balance}`);
  return wallet;
};

const buildFreshWallet = async (
  config: Config,
  logger: Logger
): Promise<Wallet & Resource> =>
  await buildWalletAndWaitForFunds(
    config,
    logger,
    toHex(randomBytes(32))
  );

// Prompt for a seed and create the wallet with that.
const buildWalletFromSeed = async (
  config: Config,
  rli: Interface,
  logger: Logger
): Promise<Wallet & Resource> => {
  const seed = await rli.question("Enter your wallet seed: ");
  return await buildWalletAndWaitForFunds(config, logger, seed);
};

const GENESIS_MINT_WALLET_SEED =
  "0000000000000000000000000000000000000000000000000000000000000042";

const WALLET_LOOP_QUESTION = `
You can do one of the following:
  1. Build a fresh wallet
  2. Build wallet from a seed
  3. Exit
Which would you like to do? `;

export const buildWallet = async (
  config: Config,
  logger: Logger,
  rli?: Interface
): Promise<(Wallet & Resource) | null> => {
  if (config instanceof StandaloneConfig) {
    return await buildWalletAndWaitForFunds(
      config,
      logger,
      GENESIS_MINT_WALLET_SEED
    );
  }
  if (rli === undefined) {
    throw new Error("No readline interface provided");
  }
  while (true) {
    const choice = await rli.question(WALLET_LOOP_QUESTION);
    switch (choice) {
      case "1":
        return await buildFreshWallet(config, logger);
      case "2":
        return await buildWalletFromSeed(config, rli, logger);
      case "3":
        logger.info("Exiting...");
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const mapContainerPort = (
  env: StartedDockerComposeEnvironment,
  url: string,
  containerName: string
) => {
  const mappedUrl = new URL(url);
  const container = env.getContainer(containerName);

  mappedUrl.port = String(container.getFirstMappedPort());

  return mappedUrl.toString().replace(/\/+$/, "");
};

export const run = async (
  config: Config,
  logger: Logger,
  dockerEnv?: DockerComposeEnvironment
): Promise<void> => {
  const rli = createInterface({ input, output, terminal: true });
  let env;
  if (dockerEnv !== undefined) {
    env = await dockerEnv.up();

    if (config instanceof StandaloneConfig) {
      config.indexer = mapContainerPort(env, config.indexer, "bboard-indexer");
      config.indexerWS = mapContainerPort(
        env,
        config.indexerWS,
        "bboard-indexer"
      );
      config.node = mapContainerPort(env, config.node, "bboard-node");
      config.proofServer = mapContainerPort(
        env,
        config.proofServer,
        "bboard-proof-server"
      );
    }
  }
  const wallet = await buildWallet(config, logger, rli);
  try {
    if (wallet !== null) {
      const walletAndMidnightProvider =
        await createWalletAndMidnightProvider(wallet);
      const providers = {
        privateStateProvider: levelPrivateStateProvider<PrivateStates>({
          privateStateStoreName: config.privateStateStoreName,
        }),
        publicDataProvider: indexerPublicDataProvider(
          config.indexer,
          config.indexerWS
        ),
        zkConfigProvider: new NodeZkConfigProvider<"vote">(config.zkConfigPath),
        proofProvider: httpClientProofProvider(config.proofServer),
        walletProvider: walletAndMidnightProvider,
        midnightProvider: walletAndMidnightProvider,
      };
      await mainLoop(providers, rli, logger);
    }
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.info("Exiting...");
      logger.debug(`${e.stack}`);
    } else {
      throw e;
    }
  } finally {
    try {
      rli.close();
      rli.removeAllListeners();
    } catch (e) {
    } finally {
      try {
        if (wallet !== null) {
          await wallet.close();
        }
      } catch (e) {
      } finally {
        try {
          if (env !== undefined) {
            await env.down();
            logger.info("Goodbye");
            process.exit(0);
          }
        } catch (e) {}
      }
    }
  }
};

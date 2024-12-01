import {
  Contract,
  Ledger,
  ledger,
  pureCircuits,
} from "./contract/managed/ballot/contract/index.cjs";
import {
  BallotContract,
  BallotDerivedState,
  BallotProviders,
  DeployedBallotContract,
} from "./types";
import {
  type BallotPrivateState,
} from "./types"
import { ContractAddress } from "@midnight-ntwrk/ledger";
import { combineLatest, from, map, Observable, tap } from "rxjs";
import { Logger } from "pino";
import { toHex } from "@midnight-ntwrk/midnight-js-utils";
import { convert_bigint_to_Uint8Array, WitnessContext } from "@midnight-ntwrk/compact-runtime";
import {
  deployContract,
  findDeployedContract,
} from "@midnight-ntwrk/midnight-js-contracts";


export declare const createBallotPrivateState: (secretKey: Uint8Array) => {
  secret_key: Uint8Array; //<ArrayBufferLike>;
};

export const witnesses = {
  secret_key: ({ privateState }: WitnessContext<Ledger, BallotPrivateState>): [BallotPrivateState, Uint8Array ] => [
    privateState,
    privateState.secret_key,
  ],
};

/** @internal */
const ballotContractInstace: BallotContract = new Contract(witnesses);

/**
 * An API for a deployed ballot contract.
 */
export interface DeployedBallotAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<BallotDerivedState>;

  vote: (candidate: string) => Promise<void>;
}

/**
 * Provides an implementation of {@link DeployedBallotContract} by adapting a deployed bulletin board
 * contract.
 *
 * @remarks
 * The `BBoardPrivateState` is managed at the DApp level by a private state provider. As such, this
 * private state is shared between all instances of {@link BallotApi}, and their underlying deployed
 * contracts. The private state defines a `'secretKey'` property that effectively identifies the current
 * user, and is used to determine if the current user is the poster of the message as the observable
 * contract state changes.
 *
 * In the future, Midnight.js will provide a private state provider that supports private state storage
 * keyed by contract address. This will remove the current workaround of sharing private state across
 * the deployed bulletin board contracts, and allows for a unique secret key to be generated for each bulletin
 * board that the user interacts with.
 */
export class BallotApi implements DeployedBallotAPI {
  /** @internal */
  private constructor(
    public readonly deployedContract: DeployedBallotContract,
    providers: BallotProviders,
    private readonly logger?: Logger
  ) {
    this.deployedContractAddress =
      deployedContract.deployTxData.public.contractAddress;
    this.state$ = combineLatest(
      [
        // Combine public (ledger) state with...
        providers.publicDataProvider
          .contractStateObservable(this.deployedContractAddress, {
            type: "latest",
          })
          .pipe(
            map((contractState) => ledger(contractState.data)),
            tap((ledgerState) =>
              logger?.trace({
                ledgerStateChanged: {
                  ledgerState: {
                    ...ledgerState,
                    alreadyVoted: ledgerState.alreadyVoted,
                    candidates: ledgerState.candidates,
                    currentVotes: ledgerState.currentVotes,
                    isOpen: ledgerState.isOpen,
                  },
                },
              })
            )
          ),
        // ...private state...
        //    since the private state of the bulletin board application never changes, we can query the
        //    private state once and always use the same value with `combineLatest`. In applications
        //    where the private state is expected to change, we would need to make this an `Observable`.
        from(
          providers.privateStateProvider.get(
            "ballotPrivateState"
          ) as Promise<BallotPrivateState>
        ),
      ],
      // ...and combine them to produce the required derived state.
      (ledgerState, privateState) => {
        return {
          organizer_pks: new Set<Uint8Array>(), //ledgerState.organizerPks,
          candidates: new Map<string, bigint>(), //ledgerState.candidates,
          current_votes: ledgerState.currentVotes,
          already_voted: new Set<Uint8Array>(), // ledgerState.alreadyVoted,
          is_open: ledgerState.isOpen,
          voters: new Set<Uint8Array>(), //ledgerState.voters,
          total_voters: ledgerState.totalVoters,
        };
      }
    );
  }

  /**
   * Gets the address of the current deployed contract.
   */
  readonly deployedContractAddress: ContractAddress;

  /**
   * Gets an observable stream of state changes based on the current public (ledger),
   * and private state data.
   */
  readonly state$: Observable<BallotDerivedState>;

  /**
   * Attempts to post a given message to the bulletin board.
   *
   * @param message The message to post.
   *
   * @remarks
   * This method can fail during local circuit execution if the bulletin board is currently occupied.
   */
  async vote(candidate: string): Promise<void> {
    this.logger?.info(`voting for: ${candidate}`);

    const txData =
      // EXERCISE 3: CALL THE post CIRCUIT AND SUBMIT THE TRANSACTION TO THE NETWORK
      await this.deployedContract.callTx // EXERCISE ANSWER
        .vote(candidate); // EXERCISE ANSWER

    this.logger?.trace({
      transactionAdded: {
        circuit: "vote",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  /**
   * Deploys a new bulletin board contract to the network.
   *
   * @param providers The bulletin board providers.
   * @param logger An optional 'pino' logger to use for logging.
   * @returns A `Promise` that resolves with a {@link BBoardAPI} instance that manages the newly deployed
   * {@link DeployedBBoardContract}; or rejects with a deployment error.
   */
  static async deploy(
    providers: BallotProviders,
    logger?: Logger
  ): Promise<BallotApi> {
    logger?.info("deployContract");

    // EXERCISE 5: FILL IN THE CORRECT ARGUMENTS TO deployContract
    const deployedBallotContract = await deployContract(providers, {
      // EXERCISE ANSWER
      privateStateKey: "ballotPrivateState", // EXERCISE ANSWER
      contract: ballotContractInstace,
      initialPrivateState: await BallotApi.getPrivateState(providers), // EXERCISE ANSWER
      args: [{ vot: [], cand: ["Red", "Blue", "Yellow"] }],
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedBallotContract.deployTxData.public,
      },
    });

    return new BallotApi(deployedBallotContract, providers, logger);
  }

  /**
   * Finds an already deployed bulletin board contract on the network, and joins it.
   *
   * @param providers The bulletin board providers.
   * @param contractAddress The contract address of the deployed bulletin board contract to search for and join.
   * @param logger An optional 'pino' logger to use for logging.
   * @returns A `Promise` that resolves with a {@link BBoardAPI} instance that manages the joined
   * {@link DeployedBBoardContract}; or rejects with an error.
   */
  static async join(
    providers: BallotProviders,
    contractAddress: ContractAddress,
    logger?: Logger
  ): Promise<BallotApi> {
    logger?.info({
      joinContract: {
        contractAddress,
      },
    });

    const deployedBallotContract = await findDeployedContract(providers, {
      contractAddress,
      contract: ballotContractInstace,
      privateStateKey: "ballotPrivateState",
      initialPrivateState: await BallotApi.getPrivateState(providers),
    });

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedBallotContract.deployTxData.public,
      },
    });

    return new BallotApi(deployedBallotContract, providers, logger);
  }

  private static async getPrivateState(
    providers: BallotProviders
  ): Promise<BallotPrivateState> {
    const existingPrivateState =
      await providers.privateStateProvider.get("ballotPrivateState");
    return (
      existingPrivateState ??
      createBallotPrivateState(Buffer.from("a".repeat(32), "hex"))
    );
  }
}

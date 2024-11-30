import {
  Contract,
  ledger,
  pureCircuits,
} from "../contract/managed/ballot/contract/index.cjs";
import {
  BallotContract,
  BallotDerivedState,
  BallotProviders,
  DeployedBallotContract,
} from "./types";
import {
  BallotPrivateState,
  witnesses,
} from "../contract/managed/ballot/contract/witness";
import { ContractAddress } from "@midnight-ntwrk/ledger";
import { combineLatest, from, map, Observable, tap } from "rxjs";
import { Logger } from "pino";
import { toHex } from "@midnight-ntwrk/midnight-js-utils";
import { convert_bigint_to_Uint8Array } from "@midnight-ntwrk/compact-runtime";

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
// TODO: Update BBoardAPI to use contract level private state storage.
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
                    state:
                      ledgerState.state === STATE.occupied
                        ? "occupied"
                        : "vacant",
                    poster: toHex(ledgerState.poster),
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
        const hashedSecretKey = pureCircuits.public_key(
          privateState.secretKey,
          convert_bigint_to_Uint8Array(32, ledgerState.instance)
        );

        return {
          state: ledgerState.state,
          message: ledgerState.message.value,
          instance: ledgerState.instance,
          isOwner: toHex(ledgerState.poster) === toHex(hashedSecretKey),
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
  async post(message: string): Promise<void> {
    this.logger?.info(`postingMessage: ${message}`);

    const txData =
      // EXERCISE 3: CALL THE post CIRCUIT AND SUBMIT THE TRANSACTION TO THE NETWORK
      await this.deployedContract.callTx // EXERCISE ANSWER
        .post(message); // EXERCISE ANSWER

    this.logger?.trace({
      transactionAdded: {
        circuit: "post",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }
}

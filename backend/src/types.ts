/**
 * Ballot common types and abstractions.
 *
 * @module
 */

import { type MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
import { type FoundContract } from "@midnight-ntwrk/midnight-js-contracts";
import type {
  Ledger,
  Contract,
  Witnesses,
} from "./contract/managed/ballot/contract/index.cjs";
import { WitnessContext } from "@midnight-ntwrk/compact-runtime";

export type BallotPrivateState = {
  readonly secret_key: Uint8Array;
};

/**
 * The private states consumed throughout the application.
 *
 * @remarks
 * {@link PrivateStates} can be thought of as a type that describes a schema for all
 * private states for all contracts used in the application. Each key represents
 * the type of private state consumed by a particular type of contract.
 * The key is used by the deployed contract when interacting with a private state provider,
 * and the type (i.e., `typeof PrivateStates[K]`) represents the type of private state
 * expected to be returned.
 *
 * Since there is only one contract type for the bulletin board example, we only define a
 * single key/type in the schema.
 *
 * @public
 */
export type PrivateStates = {
  /**
   * Key used to provide the private state for {@link Ballot} deployments.
   */
  readonly ballotPrivateState: BallotPrivateState;
};

/**
 * Represents a bulletin board contract and its private state.
 *
 * @public
 */
export type BallotContract = Contract<
  BallotPrivateState,
  Witnesses<BallotPrivateState>
>;

/**
 * The keys of the circuits exported from {@link BBoardContract}.
 *
 * @public
 */
export type BallotCircuitKeys = Exclude<
  keyof BallotContract["impureCircuits"],
  number | symbol
>;

/**
 * The providers required by {@link BBoardContract}.
 *
 * @public
 */
export type BallotProviders = MidnightProviders<
  BallotCircuitKeys,
  PrivateStates
>;

/**
 * A {@link BBoardContract} that has been deployed to the network.
 *
 * @public
 */
export type DeployedBallotContract = FoundContract<
  BallotPrivateState,
  BallotContract
>;

/**
 * A type that represents the derived combination of public (or ledger), and private state.
 */
export type BallotDerivedState = {
  readonly organizer_pks: Set<Uint8Array>;
  readonly voters: Set<Uint8Array>;
  readonly candidates: Map<string, bigint>;
  readonly total_voters: bigint;
  readonly current_votes: bigint;
  readonly already_voted: Set<Uint8Array>;
  readonly is_open: boolean;
};

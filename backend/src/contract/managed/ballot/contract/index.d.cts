import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
  secret_key(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
}

export type ImpureCircuits<T> = {
  vote(context: __compactRuntime.CircuitContext<T>, candidate: string): __compactRuntime.CircuitResults<T, void>;
}

export type PureCircuits = {
  public_key(sk: Uint8Array): Uint8Array;
}

export type Circuits<T> = {
  vote(context: __compactRuntime.CircuitContext<T>, candidate: string): __compactRuntime.CircuitResults<T, void>;
  public_key(context: __compactRuntime.CircuitContext<T>, sk: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
}

export type Ledger = {
  organizerPks: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  voters: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  candidates: {
    isEmpty(): boolean;
    size(): bigint;
    member(key: string): boolean;
    lookup(key: string): bigint;
    [Symbol.iterator](): Iterator<[string, bigint]>
  };
  readonly totalVoters: bigint;
  readonly currentVotes: bigint;
  alreadyVoted: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly isOpen: boolean;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>,
               params: { vot: Uint8Array[], cand: string[] }): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;

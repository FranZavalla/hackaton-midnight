
## Feedback

#### Excessive RAM usage when compiling contracts:

During contract compilation, if the machine's RAM capacity is exceeded, the process terminates without notifying the failure. This results in the compiled contract files (.prove and .zkey) being empty, causing errors when attempting to deploy the contract using the deployContract function from midnight-js-contracts.

#### No password prompt when signing in the user interface (UI):

When signing in through the UI, the wallet does not prompt for a password. Is this a bug?

#### Conflict between Lace Cardano and Lace Midnight installations:

If both Lace Cardano and Lace Midnight are installed, the system defaults to using Lace Cardano.

#### Unclear integration process for contracts in TypeScript with a Next.js frontend:

Following the tutorial, it’s unclear how to integrate the interface/API of a contract in TypeScript (which relies on Node.js libraries) with a frontend built using Next.js.

#### No native build found in some architectures

Using the `@midnight-ntwrk/midnight-js-level-private-state-provider` library. We have the following error that comes from `classic-level` dependency:

```
unhandledRejection: Error: No native build was found for platform=linux arch=x64 runtime=node abi=127 uv=1 libc=glibc node=22.11.0
```

Other users with multiple architectures had the [same problem](https://github.com/Level/classic-level/issues/82).


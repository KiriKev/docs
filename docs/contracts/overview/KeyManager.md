---
sidebar_position: 2
---

# Key Manager

The Key Manager uses the concept of permissions to _authorize_ any addresses (dApps, protocols, devices, etc…) to do certain specific actions on the contract it is linked to.

But why should you give anybody access to your smart contract? What is the intention behind doing this? How does the Key Manager enables that?

As we will see, the Key Manager brings a different insight into the concept of ownership and permissions.

Let's illustrate with some examples. A Key Manager can be used with different setups. For intance:

- to control a LSP0ERC725Account like a Universal Profile.
- to control a Token contract.

## Example with a Universal Profile

To illustrate, in the case of Universal Profile and the browser extension, you can define your EOA / private keys (hold within your device, like in the Browser Extension) to be **the address with all the permissions** to do anything (the main admin account).

Afterwards, you can grant partial access to dApp and protocol (more specifically the smart contract addresses behind them), so that they can use your Universal Profile to interact on your behalf. This catalyze interactions on the blockchain, where your Universal Profile can do more and operate automatically in controlled manner, without requiring the main profile owner to have to do everything.

### Allowed ERC725Y Data Keys

:::note

If controller has `SETDATA` permission but has no `AllowedERC725YDataKeys`, controller will not be able to use the `SETDATA` permission at all.

:::

Key Manager allows for restricting controller addresses to change only specific or dynamic data keys. In order to achieve such functionallity one could encode a set of data keys to [`bytes[CompactBytesArray]`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#bytescompactbytesarray), and store them under the [Allowed ERC725Y Data Keys](/standards/access-control/lsp6-key-manager.md#allowed-erc725y-data-keys) data key.

#### Specific Data Keys

A _Specific Data Key_ must have the length of 32 bytes. Setting a _Specific Data Key_ in the [Allowed ERC725Y Data Keys](/standards/access-control/lsp6-key-manager.md#allowed-erc725y-data-keys) will allow the controller to only modify the data value of that _Specific Data Key_.

#### Dynamic Data Keys

A _Dynamic Data Key_ can have any length between 0 and 32 (except 0 and 32). Setting a _Dynamic Data Key_ in the [Allowed ERC725Y Data Keys](/standards/access-control/lsp6-key-manager.md#allowed-erc725y-data-keys) will allow the controller to modify the data value of any data key that starts exactly with that _Dynamic Data Key_.

Example:

Dynamic Data Key - `0xcafe0000cafe0000beef0000beef`

| Data key                                                             | Can modify data value? |
| :------------------------------------------------------------------- | :--------------------- |
| `0xcafe0000cafe0000beef0000beef000000000000000000000000000000000000` | ✅                     |
| `0xcafe0000cafe0000beef0000beef000000000000000000000000000000000123` | ✅                     |
| `0xcafe0000cafe0000beef0000beefcafecafecafecafecafecafecafecafecafe` | ✅                     |
| `0x0000000000000000000000000000cafecafecafecafecafecafecafecafecafe` | ❌                     |
| `0x000000000000000000000000000000000000cafe0000cafe0000beef0000beef` | ❌                     |

### Allowed Calls

:::note

If controller has `CALL` permission but has no `AllowedCalls`, controller will not be able to use the `CALL` permission at all.

:::

Key Manager allows for restricting controller addresses to be able to call specific functions on specific addresses which should be of a specific standard. In order to achieve such functionallity one could encode a set of type calls, addresses, standards and functions to [`bytes[CompactBytesArray]`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#bytesncompactbytesarray), and store them under the [Allowed Calls](../../standards/access-control/lsp6-key-manager.md#allowed-calls) data key.

_E.g._

Supposedly we have the following `AllowedCalls`:
`0x002000000002cafecafecafecafecafecafecafecafecafecafe24871b3d7f23690c002000000003cafecafecafecafecafecafecafecafecafecafe24871b3d44c028fe`

It can be decoded as:

| Allowed Calls       |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First allowed call  | **Call Types** - `0x00000002` (Call) <br/> **Address** - `0xcafecafecafecafecafecafecafecafecafecafe` <br/> **Standard** - `0x24871b3d` (LSP0) <br/> **Function** - `0x7f23690c` (`setData(bytes32,bytes)`)                                 | - This allowed call permits the controller to use the function `setData(bytes32,bytes)` in the contract deployed at address `0xcafecafecafecafecafecafecafecafecafecafe`. <br/> - When calling that function the operation type has to be `CALL` with no value being sent. <br/> - The address `0xcafecafecafecafecafecafecafecafecafecafe` has to return true to `ERC165.supportsInterface(0x24871b3d)`.                    |
| Second allowed call | **Call Types** - `0x00000003` (Transfervalue & Call) <br/> **Address** - `0xcafecafecafecafecafecafecafecafecafecafe` <br/> **Standard** - `0x24871b3d` (LSP0) <br/> **Function** - `0x44c028fe` (`execute(uint256,address,uint256,bytes)`) | - This allowed call permits the controller to use the function `execute(uint256,address,uint256,bytes)` in the contract deployed at address `0xcafecafecafecafecafecafecafecafecafecafe`. <br/> - When calling that function the operation type has to be `CALL`, you can send value as well. <br/> - The address `0xcafecafecafecafecafecafecafecafecafecafe` has to return true to `ERC165.supportsInterface(0x24871b3d)`. |

## Sequential relay calls in the same channel

When executing 3 sequential relay calls with sequential nonces in a single channel (= nonces from the KeyManager retrieved via [`getNonce`](../contracts/LSP6KeyManager/LSP6KeyManager.md#getnonce), keep in mind that **if the first transaction does revert, the next 2 will revert in turns**. That happens because a Key Manager nonce is assigned to each relay call.

E.g.:

- First relay call - nonce is 4
- Second relay call - nonce is 5
- Third relay call - nonce is 6

One of the requirements for executing a relay call is that **the latest nonce (for a specific signer) stored on-chain in the Key Manager contract must be the same as the one used when signing the executed relay call**. After each successful execution, the on-chain nonce is incremented.

Given the example above, the on-chain nonce is 4 and we are executing the relay calls.

**If the first relay call pass ✅**

- First relay call: nonce was 4 -> incremented to 5
- Second relay call: nonce was 5 -> incremented to 6
- Third relay call: nonce was 6 -> incremented to 7

**If the first relay call fails ❌**

- **First relay call reverts ❌** nonce was 4 -> nonce remains 4
- Second relay call: nonce on-chain is 4 -> nonce used to sign was 5 = reverts ❌ with [`InvalidRelayNonce`](../contracts//LSP6KeyManager/LSP6KeyManager.md#invalidrelaynonce)
- Third relay call: nonce on-chain is 5 -> nonce used to sign was 6 = reverts ❌ with [`InvalidRelayNonce`](../contracts//LSP6KeyManager/LSP6KeyManager.md#invalidrelaynonce)

## Further Reading

- [The Bytecode episode #4 (Youtube) - overview of the Solidity code of the `LSP6KeyManagerCore.sol` by Jean Cavallera](https://www.youtube.com/watch?v=2Sm9LsCPjdE)

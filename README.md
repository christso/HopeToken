# Introduction

This is the repo for the Hope Diamond Token.

This smart contract has been deployed here:
https://rinkeby.etherscan.io/address/0x4ec0260dab5c3d45791f480267a8fc003950e5f7

# Roadmap

1. ERC20 Token
1. Testing with Truffle on Public Test Net
1. Deploy on Main Block Net
1. Testing with end-user apps like MetaMask or MEW.
1. Create Docker container

# Contract Behavior

Modify
[PoS Token](https://etherscan.io/address/0xee609fe292128cad03b786dbb9bc2634ccdbe7fc#code)
to create MVP.

Initialize supply of 10,000 tokens.

Look at how much DMD is minted offline. Then call the Mint function from the
address of the pool administrator. If you minted 100 coins, then we send 10
coins to the address that owns 10% of the coins. You do that by querying the
addresses to balances to see who owns how many. The mint() function will require
the sending address to have permission to mint.

Calculate the percentage allocation by address offline (outside of blockchain).

Call batchTransfer to allocate tokens to specific addresses currently on
spreadsheet. This will update mapping(address => uint256). You will need to pass
an array of recipients and how much to transfer them.

Show balances for each account in mapping(address => uint256)

Rectify scenario where an address with permission to mint has been compromised
and has performed unintended mints and transfers. In such a scenario, the
contract owner will need to revoke the permission, and assign it to another
address. This is implemented as follows:

* The contract owner can grant and revoke permission to invoke mint(). The
  permissions mapping is of type mapping(address => bool).
* mint() can accept a negative uint so that we can decrease the supply back to
  the previous amount.
* transfer back tokens so the transaction is reversed. This will undo the
  transfer() function.
* burn tokens that should not have been minted.

# Truffle Commands

Getting Started

```
// save the contract instance to a variable
HDMDToken.deployed().then(function(instance){hdmd=instance});

// call the totalSupply contract variable and save the return value to a local variable
hdmd.totalSupply.call().then(function(result) { totalSupply = result.toNumber(); });

// display the value of totalSupply
console.log(totalSupply);
```

Batch Transfer

```
// Transfer $100 and $200 to accounts[1] and accounts[2] respectively
var accounts = web3.eth.accounts;
hdmd.batchTransfer([accounts[1],accounts[2],accounts[3]],[120000000000,100000000000,50000000000])

// check balance of accounts[1]
hdmd.balanceOf(accounts[1]);
```

Minting

```
// Grant permissions for account[0] to mint
hdmd.allowMinter(accounts[0]);

// Mint 100 coins
hdmd.mint(100);
```

Burning

```
// Redeem 100 DMD tokens into DMD address 'dQmpKBcneq1ZF27iuJsUm8dQ2QkUriKWy3'
hdmd.burn(100, 'dQmpKBcneq1ZF27iuJsUm8dQ2QkUriKWy3')
```

# Task List

### Deploy Contract

* [x] Deploy on Rinkeby Test Net
* [ ] Deploy on Main Net
* [ ] Verify contract on EtherScan

# Troubleshooting

### When you've changed your source code, and do truffle migrate, you get message 'Network up to date'

Solution: Run command `truffle migrate --reset`

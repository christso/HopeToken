# Roadmap

1. ERC20 Token
1. Testing with Truffle on Public Test Net
1. Deploy on Main Block Net
1. Testing with end-user apps like MetaMask or MEW.
1. Create Docker container

# Contract Behavior

Modify [PoS Token](https://etherscan.io/address/0xee609fe292128cad03b786dbb9bc2634ccdbe7fc#code) to create MVP.

Initialize supply of 10,000 tokens.

Look at how much DMD is minted offline. Then call the Mint function from the address of the pool administrator. If you minted 100 coins, then we send 10 coins to the address that owns 10% of the coins. You do that by querying the addresses to balances to see who owns how many. The mint() function will require the sending address to have permission to mint.

Calculate the percentage allocation by address offline (outside of blockchain).

Call batchTransfer to allocate tokens to specific addresses currently on spreadsheet. This will update mapping(address => uint256). You will need to pass an array of recipients and how much to transfer them.

Show balances for each account in mapping(address => uint256)

Rectify scenario where an address with permission to mint has been compromised and has performed unintended mints and transfers. In such a scenario, the contract owner will need to revoke the permission, and assign it to another address. This is implemented as follows:
* The contract owner can grant and revoke permission to invoke mint(). The permissions mapping is of type mapping(address => bool).
* mint() can accept a negative uint so that we can decrease the supply back to the previous amount.
* transfer back tokens so the transaction is reversed. This will undo the transfer() function.
* burn tokens that should not have been minted.

# Deployment

Deploy onto Main Network using geth.

Test transfer tokens using end-user tools like MyEtherWallet or MetaMask, similar to the workflow for the [COSS Token](https://coss.io/coss-token-based-fee-split-allocation-tutorial).

# Automation

Create NodeJS app that watches the DMD blockchain, get the token balances in ETH addresses, mints the new coins (by invoking mint()) and sends them off using web3.

# Truffle Commands

```
// save the contract instance to a variable
HDMDToken.deployed().then(function(instance){hdmd=instance});

// call the totalSupply contract variable and save the return value to a local variable
hdmd.totalSupply.call().then(function(result) { totalSupply = result.toNumber(); });

// display the value of totalSupply
console.log(totalSupply);
```

# Task List

### Create Contract Functions

- [ ] show what addresses are allowed to mint

### Deploy Contract

- [x] Deploy on Rinkeby Test Net

### Create Link Between DMD Blockchain and HDMD Token

- [x] Create web3 listener on HDMD Token
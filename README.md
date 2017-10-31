# Modify PoS Token smart contract to create MVP.

Modify [PoS Token](https://etherscan.io/address/0xee609fe292128cad03b786dbb9bc2634ccdbe7fc#code) to create MVP.

Initialize supply of 10,000 tokens.

Look at how much DMD is minted offline. Then call the Mint function from the address of the pool administrator. If you minted 100 coins, then we send 10 coins to the address that owns 10% of the coins. You do that by querying the addresses to balances to see who owns how many.

Calculate the percentage allocation by address offline (outside of blockchain).

Call batchTransfer to allocate tokens to specific addresses currently on spreadsheet. This will update mapping(address => uint256). You will need to pass an array of recipients and how much to transfer them.

Show balances for each account in mapping(address => uint256) 

# Deployment

Deploy onto Main Network using geth.

Test transfer tokens using end-user tools like MyEtherWallet or MetaMask, similar to the workflow for the [COSS Token](https://coss.io/coss-token-based-fee-split-allocation-tutorial).

# Automation

Create NodeJS app that watches the DMD blockchain, get the token balances in ETH addresses, mints the new coins (by invoking mint()) and sends them off using web3.
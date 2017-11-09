// TODO: Tests look ugly. We need to refactor.

var HDMDToken = artifacts.require("./HDMDToken.sol");

contract('HDMDToken', function (accounts) {

    it("should put 10000 HDMD tokens in the first account", function () {
        return HDMDToken.deployed().then(function (instance) {
            return instance.balanceOf.call(accounts[0]);
        }).then(function (balance) {
            let decimals = 8;
            assert.equal(balance.valueOf(), 10000 * 10**decimals, "10000 wasn't in the first account");
        });
    });

    it("should mint to calling address if minter is authorized", function () {
        var hdmd;
        var mintValue = 1200;
        var totalInitialSupply;
        var balanceOfMinter;
        var initialBalanceOfMinter;

        return HDMDToken.deployed().then(function (instance) {
            hdmd = instance;
            return hdmd.totalSupply.call();
        })
            .then(function (_totalInitialSupply) {
                totalInitialSupply = _totalInitialSupply.toNumber();
            })

            // get balance of minting account before minting
            .then(function () {
                return hdmd.balanceOf(accounts[0]);
            }).then(function (balance) {
                initialBalanceOfMinter = balance.toNumber();
            })

            // mintmint
            .then(function () {
                hdmd.allowMinter(accounts[0]);
                hdmd.mint(mintValue, 'dmdTxn');
                return;
            })

            // assert that the total supply increased.
            .then(function () {
                return hdmd.totalSupply.call();
            }).then(function (totalSupply) {
                totalSupply = totalSupply.toNumber();
                assert.equal(totalSupply, totalInitialSupply + mintValue, "Minted amount did not increase total supply");
            })

            // assert that the calling address got the new tokens.     
            .then(function () {
                return hdmd.balanceOf(accounts[0]);
            }).then(function (balanceOfMinter) {
                balanceOfMinter = balanceOfMinter.toNumber();
                assert.equal(balanceOfMinter, initialBalanceOfMinter + mintValue, "Minted amount did not match the sending account balance");
            })
    });

    it("should not mint if minter is unauthorized", function () {
        var hdmd;
        var mintValue = 1200;
        var totalInitialSupply;
        var balanceOfMinter;
        var initialBalanceOfMinter;

        return HDMDToken.deployed().then(function (instance) {
            hdmd = instance;
            return hdmd.totalSupply.call();
        })
            .then(function (_totalInitialSupply) {
                totalInitialSupply = _totalInitialSupply.toNumber();
            })

            // mint
            .then(function () {
                hdmd.mint(mintValue, 'dmdTxn');
                return;
            })

            // get total supply
            .then(function () {
                return hdmd.totalSupply.call();
            }).then(function (totalSupply) {
                assert(totalSupply, totalInitialSupply,
                    "Total supply cannot be increased by address that is not authorized to mint");
            })

    });

    it("should be able to transfer from the wallet that invoked the contract", function () {
        var hdmd;
        var account_one = accounts[0];
        var account_two = accounts[1];

        var account_one_starting_balance;
        var account_two_starting_balance;
        var account_one_ending_balance;
        var account_two_ending_balance;

        var amount = 10;

        return HDMDToken.deployed().then(function (instance) {
            hdmd = instance;
            return hdmd.balanceOf.call(account_one);
        }).then(function (balance) {
            account_one_starting_balance = balance.toNumber();
            return hdmd.balanceOf.call(account_two);
        }).then(function (balance) {
            account_two_starting_balance = balance.toNumber();
            // transfer from account_one to account_two
            return hdmd.transfer(account_two, amount, { from: account_one });
        }).then(function (balance) {
            return hdmd.balanceOf.call(account_one);
        }).then(function (balance) {
            account_one_ending_balance = balance.toNumber();
            return hdmd.balanceOf.call(account_two);
        }).then(function (balance) {
            account_two_ending_balance = balance.toNumber();
            assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
            assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
        });

    });

    it("should be able to burn tokens in wallet beloning to the invoker", function () {
        var hdmd;
        var burnValue = 100;
        var totalInitialSupply;
        var balanceOfBurner;
        var initialBalanceOfBurner;

        return HDMDToken.deployed().then(function (instance) {
            hdmd = instance;
            return hdmd.totalSupply.call();
        }).then(function (_totalInitialSupply) {
            // get supply before burn
            totalInitialSupply = _totalInitialSupply.toNumber();

            // burn HDMD and log DMD address
            hdmd.burn(burnValue, "dbVtEGLTRYhStuL2rapCJS6yPusaWyuG5N");
        }).then(function () {
            // get total supply
            return hdmd.totalSupply.call();
        }).then(function (totalSupply) {
            totalSupply = totalSupply.toNumber();
            assert(totalSupply, totalInitialSupply - burnValue,
                "Total supply should have decreased by the amount burned.");
        })
    });

    it("should be able to allocate a batch of tokens", function () {
        var hdmd;
        var recipients = [];
        var values = [];
        var startingBalances = [];
        var endingBalances = [];
        var si = 0;
        var ei = 0;
        endingBalances.length = accounts.length;

        return HDMDToken.deployed().then(function (instance) {
            hdmd = instance;

            // get starting balances for each account
            return hdmd.balanceOf.call(accounts[si]);
        }).then(function (balance) {
            startingBalances[si] = balance.toNumber();
            si = 1;
            return hdmd.balanceOf.call(accounts[si]);
        }).then(function (balance) {
            startingBalances[si] = balance.toNumber();
            si = 2;
            return hdmd.balanceOf.call(accounts[si]);
        }).then(function (balance) {
            startingBalances[si] = balance.toNumber();
            si = 3;
            return hdmd.balanceOf.call(accounts[si]);
        }).then(function (balance) {
            startingBalances[si] = balance.toNumber();

            // batch transfer
            recipients = [accounts[0], accounts[1], accounts[2], accounts[3]];
            values = [0, 1000, 900, 2000];
            hdmd.batchTransfer(recipients, values);
        }).then(function () {
            return hdmd.balanceOf.call(accounts[ei]);
        }).then(function (balance) {

            // get ending balances for each account
            endingBalances[ei] = balance.toNumber();
            ei = 1;
            return hdmd.balanceOf.call(accounts[ei]);
        }).then(function (balance) {
            endingBalances[ei] = balance.toNumber();
            ei = 2;
            return hdmd.balanceOf.call(accounts[ei]);
        }).then(function (balance) {
            endingBalances[ei] = balance.toNumber();
            ei = 3;
            return hdmd.balanceOf.call(accounts[ei]);
        }).then(function (balance) {
            endingBalances[ei] = balance.toNumber()
        }).then(function () {

            // assert that accounts have been allocated the correct amounts
            var a = 1;
            assert.equal(endingBalances[a] - startingBalances[a], values[a],
                "Balance of account did not change by the expected value");
            a = 2;
            assert.equal(endingBalances[a] - startingBalances[a], values[a],
                "Balance of account did not change by the expected value");
            a = 3;
            assert.equal(endingBalances[a] - startingBalances[a], values[a],
                "Balance of account did not change by the expected value");

            // assert that total supply is unchanged
            var totalEndingBalance = endingBalances.reduce((a, b) => a + b, 0);
            var totalStartingBalance = startingBalances.reduce((a, b) => a + b, 0);
            assert.equal(totalEndingBalance, totalStartingBalance, "Total supply should not have changed.")
        })
    });


    it("should be able to batch transfer into contract owner wallet", function () {
        var hdmd;
        var recipients = [];
        var values = [];
        var startingBalances = [];
        var endingBalances = [];
        var si = 0;
        var ei = 0;
        endingBalances.length = accounts.length;

        return HDMDToken.deployed().then(function (instance) {
            hdmd = instance;
            return hdmd.balanceOf.call(accounts[0]);
        }).then(function (balance) {
            ownerBalance = balance.toNumber();
            return ownerBalance;
        }).then(function (balance) {
            // initial values will by 20% transferred from the owner's account
            hdmd.transfer(accounts[1], 100);
            hdmd.transfer(accounts[2], 200);
            hdmd.transfer(accounts[3], 300);
        }).then(function () {

            // get starting balances for each account
            return hdmd.balanceOf.call(accounts[si]);
        }).then(function (balance) {
            startingBalances[si] = balance.toNumber();
            si = 1;
            return hdmd.balanceOf.call(accounts[si]);
        }).then(function (balance) {
            startingBalances[si] = balance.toNumber();
            si = 2;
            return hdmd.balanceOf.call(accounts[si]);
        }).then(function (balance) {
            startingBalances[si] = balance.toNumber();
            si = 3;
            return hdmd.balanceOf.call(accounts[si]);
        }).then(function (balance) {
            startingBalances[si] = balance.toNumber();
        }).then(function () {

            // reverse batch transfer

            recipients = [accounts[1], accounts[2], accounts[3]];
            values = [10, 20, 30]; // transfer 10% back to owner

            hdmd.reverseBatchTransfer(recipients, values);
        }).then(function () {

            // get ending endingBalances for each account
            return hdmd.balanceOf.call(accounts[ei]);
        }).then(function (balance) {

            // get ending endingBalances for each account
            endingBalances[ei] = balance.toNumber();
            ei = 1;
            return hdmd.balanceOf.call(accounts[ei]);
        }).then(function (balance) {
            endingBalances[ei] = balance.toNumber();
            ei = 2;
            return hdmd.balanceOf.call(accounts[ei]);
        }).then(function (balance) {
            endingBalances[ei] = balance.toNumber();
            ei = 3;
            return hdmd.balanceOf.call(accounts[ei]);
        }).then(function (balance) {
            endingBalances[ei] = balance.toNumber()
        }).then(function () {

            // assert that accounts have been allocated the correct amounts
            var a = 1;
            assert.equal(endingBalances[a] - startingBalances[a], -10,
                "Balance of account did not change by the expected value");
            a = 2;
            assert.equal(endingBalances[a] - startingBalances[a], -20,
                "Balance of account did not change by the expected value");
            a = 3;
            assert.equal(endingBalances[a] - startingBalances[a], -30,
                "Balance of account did not change by the expected value");

            // assert that total supply is unchanged
            var totalEndingBalance = endingBalances.reduce((a, b) => a + b, 0);
            var totalStartingBalance = startingBalances.reduce((a, b) => a + b, 0);
            assert.equal(totalEndingBalance, totalStartingBalance, "Total supply should not have changed.")
        })

    });

    it("should throw exception if batch transfer called by non-owner", function () {
        var hdmd;
        return HDMDToken.deployed().then(function (instance) {
            hdmd = instance;
            return hdmd.batchTransfer([accounts[0]],[1], {from: accounts[1]});
        }).then(function(result) {
            assert(false, "was supposed to throw but didn't.");
        }).catch(function(error) {
            if(error.toString().indexOf("invalid opcode") != -1) {
                console.log("We were expecting a Solidity throw, we got one. Test succeeded.");
            } else {
                 // if the error is something else (e.g., the assert from previous promise), then we fail the test
                assert(false, error.toString());
            }
        })
    });
});
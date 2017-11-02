var HDMDToken = artifacts.require("./HDMDToken.sol");

contract('HDMDToken', function (accounts) {

    it("should put 10000 HDMDToken in the first account", function () {
        return HDMDToken.deployed().then(function (instance) {
            return instance.balanceOf.call(accounts[0]);
        }).then(function (balance) {
            assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
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

            // mint
            .then(function () {
                hdmd.allowMinter(accounts[0]);
                hdmd.mint(mintValue);
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
                hdmd.mint(mintValue);
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

    it("should be able to transfer from wallet if you are the owner", function () {
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

    it("should be able to burn tokens", function () {
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

        // get starting endingBalances for each account
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
        }).then(function() {
            return hdmd.balanceOf.call(accounts[ei]);
        }).then(function(balance) {

        // get ending endingBalances for each account
            endingBalances[ei] = balance.toNumber();
            ei = 1;
            return hdmd.balanceOf.call(accounts[ei]);
        }).then(function(balance) {
            endingBalances[ei] = balance.toNumber();
            ei = 2;
            return hdmd.balanceOf.call(accounts[ei]);
        }).then(function(balance) {
            endingBalances[ei] = balance.toNumber();
            ei = 3;
            return hdmd.balanceOf.call(accounts[ei]);
        }).then(function(balance) {
            endingBalances[ei] = balance.toNumber()
        }).then(function() {

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
            var totalEndingBalance = endingBalances.reduce((a,b) => a+b, 0);
            var totalStartingBalance = startingBalances.reduce((a,b) => a+b, 0);  
            assert.equal(totalEndingBalance, totalStartingBalance, "Total supply should not have changed.")          
        })
    });
});
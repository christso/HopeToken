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
            return hdmd.totalInitialSupply.call();
        })
        .then(function(_totalInitialSupply) {
            totalInitialSupply = _totalInitialSupply.toNumber();
        })
        
        // get balance of minting account before minting
        .then(function() {
            return hdmd.balanceOf(accounts[0]);
        }).then(function(balance) {
            initialBalanceOfMinter = balance.toNumber();
        })
        
        // mint
        .then(function() {
            hdmd.allowMinter(accounts[0]);
            hdmd.mint(mintValue);
            return;
        })
        
        // assert that the total supply increased.
        .then(function() {
            return hdmd.totalSupply.call();
        }).then(function (totalSupply) {
            totalSupply = totalSupply.toNumber();
            assert.equal(totalSupply, totalInitialSupply + mintValue, "Minted amount did not increase total supply");
        })
        
        // assert that the calling address got the new tokens.     
        .then(function() {
            return hdmd.balanceOf(accounts[0]);
        }).then(function(balanceOfMinter) {
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
            return hdmd.totalInitialSupply.call();
        })
        .then(function(_totalInitialSupply) {
            totalInitialSupply = _totalInitialSupply.toNumber();
        })
        
        // mint
        .then(function() {
            hdmd.mint(mintValue);
            return;
        })

        // get total supply
        .then(function() {
            return hdmd.totalSupply.call();
        }).then(function(totalSupply) {
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
        }).then(function(balance) {
            account_two_starting_balance = balance.toNumber();
            // transfer from account_one to account_two
            return hdmd.transfer(account_two, amount, {from: account_one});
        }).then(function(balance) {
            return hdmd.balanceOf.call(account_one);
        }).then(function(balance) {
            account_one_ending_balance = balance.toNumber();
            return hdmd.balanceOf.call(account_two);
        }).then(function(balance) {
            account_two_ending_balance = balance.toNumber();
            assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
            assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
        });

    });

    // TODO: burn tokens
    it("should be able to burn tokens", function () {
        var hdmd;
        var burnValue = 100;
        var totalInitialSupply;
        var balanceOfBurner;
        var initialBalanceOfBurner;

        return HDMDToken.deployed().then(function (instance) {
            hdmd = instance;
            return hdmd.totalSupply.call();
        }).then(function(_totalInitialSupply) {
            // get supply before burn
            totalInitialSupply = _totalInitialSupply.toNumber();
            
            // burn HDMD and log DMD address
            hdmd.burn(burnValue, "dbVtEGLTRYhStuL2rapCJS6yPusaWyuG5N");
        }).then(function() {
            // get total supply
            return hdmd.totalSupply.call();
        }).then(function(totalSupply) {
            totalSupply = totalSupply.toNumber();
            assert(totalSupply, totalInitialSupply - burnValue, 
                "Total supply should have decreased by the amount burned.");
        })
    });

    // TODO: allocate tokens with batchTransfer
});
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
        var hdmdInstance;
        var mintValue = 1200;
        var totalInitialSupply;
        var balanceOfMinter;
        var initialBalanceOfMinter;

        return HDMDToken.deployed().then(function (instance) {
            hdmdInstance = instance;
            return hdmdInstance.totalInitialSupply.call();
        })
        .then(function(_totalInitialSupply) {
            totalInitialSupply = _totalInitialSupply.toNumber();
        })
        
        // get balance of minting account before minting
        .then(function() {

            return hdmdInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            initialBalanceOfMinter = balance.toNumber();
        })
        
        // mint
        .then(function() {
            hdmdInstance.allowMinter(accounts[0]);
            hdmdInstance.mint(mintValue);
            return;
        })
        
        // assert that the total supply increased.
        .then(function() {
            return hdmdInstance.totalSupply.call();
        }).then(function (totalSupply) {
            totalSupply = totalSupply.toNumber();
            assert.equal(totalSupply, totalInitialSupply + mintValue, "Minted amount did not increase total supply");
        })
        
        // assert that the calling address got the new tokens.     
        .then(function() {
            return hdmdInstance.balanceOf(accounts[0]);
        }).then(function(balanceOfMinter) {
            balanceOfMinter = balanceOfMinter.toNumber();
            assert.equal(balanceOfMinter, initialBalanceOfMinter + mintValue, "Minted amount did not match the sending account balance");
        })
    });

    // TODO
    it("should not mint if minter is unauthorized", function () {
        return HDMDToken.deployed().then(function (instance) {
            // call mint function
        }).then(function (balance) {
            // asset that supply remains the same
        });
    });

    // TODO
    it("should be able to transfer from wallet if you are the owner", function () {
        return HDMDToken.deployed().then(function (instance) {
            // call mint function
        }).then(function (balance) {
            // asset that supply remains the same
        });
    });

    // TODO
    it("should be able to burn tokens", function () {
        return HDMDToken.deployed().then(function (instance) {
            // call mint function
        }).then(function (balance) {
            // asset that supply remains the same
        });
    });
});
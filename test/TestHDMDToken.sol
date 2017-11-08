pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/HDMDToken.sol";

contract TestHDMDToken {

    function testInitialBalanceUsingDeployedContract() {
        HDMDToken hdmd = HDMDToken(DeployedAddresses.HDMDToken());
        uint decimals = 8;
        uint expected = 10000 * 10**decimals;

        Assert.equal(hdmd.balanceOf(msg.sender), expected, "Owner should have 10000 HDMDToken initially");
    }

}

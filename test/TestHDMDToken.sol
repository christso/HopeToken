pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/HDMDToken.sol";

contract TestHDMDToken {

  function testInitialBalanceUsingDeployedContract() {
    HDMDToken hdmd = HDMDToken(DeployedAddresses.HDMDToken());

    uint expected = 10000;

    Assert.equal(hdmd.balanceOf(tx.origin), expected, "Owner should have 10000 HDMDToken initially");
  }

  function testInitialBalanceWithNewHDMDToken() {
    HDMDToken hdmd = new HDMDToken();

    uint expected = 10000;

    Assert.equal(hdmd.balanceOf(tx.origin), expected, "Owner should have 10000 HDMDToken initially");
  }

}

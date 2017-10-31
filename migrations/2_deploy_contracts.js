var HDMDToken = artifacts.require("HDMDToken");
var SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, HDMDToken);
  deployer.deploy(HDMDToken);
};

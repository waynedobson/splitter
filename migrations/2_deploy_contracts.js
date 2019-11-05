var Splitter = artifacts.require("./Splitter.sol");

const aliceAddress = "0x695E0E26BAe141f014921c12C92D45fF845bf32c";
const bobAddress = "0xE75e73F417930F23eAd63180A05E132aF97b39e5";
const carolAddress = "0xb1885953430884544Bc205A90A6e2c810d433013";

module.exports = function(deployer) {
  deployer.deploy(Splitter, aliceAddress, bobAddress, carolAddress);
};

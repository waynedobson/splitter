const Splitter = artifacts.require("./Splitter.sol");

let splitterInstance;
let splitterAddress;

contract("Splitter constructor", accounts => {
  const creatorAddress = accounts[0]; // 0x09774FDeF12B16A6E75ACDA7714d418516c32847
  const aliceAddress = accounts[1]; //0x695E0E26BAe141f014921c12C92D45fF845bf32c
  const bobAddress = accounts[2]; // 0xE75e73F417930F23eAd63180A05E132aF97b39e5
  const carolAddress = accounts[3]; // 0xb1885953430884544Bc205A90A6e2c810d433013
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  it("...rejects 0x00 addresses for Alice", async () => {
    try {
      await Splitter.new(zeroAddress, bobAddress, carolAddress);

      assert.fail("0x00 allowed as Alice addrss");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...rejects 0x00 addresses for Bob", async () => {
    try {
      await Splitter.new(aliceAddress, zeroAddress, carolAddress);

      assert.fail("0x00 allowed as Alice addrss");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...rejects 0x00 addresses for Carol", async () => {
    try {
      await Splitter.new(aliceAddress, zeroAddress, carolAddress);

      assert.fail("0x00 allowed as Alice addrss");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });
});

const Splitter = artifacts.require("./Splitter.sol");

let splitterInstance;
let splitterAddress;

contract("Splitter constructor", accounts => {
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  const [creatorAddress, aliceAddress, bobAddress, carolAddress] = accounts;

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

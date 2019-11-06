const Splitter = artifacts.require("./Splitter.sol");

let splitterInstance;

contract("Splitter features for Bob", accounts => {
  let splitterInstance;

  const invalidChecksumAddress = "0x31fC3D52f842E70deA4F990e4CfcAFa4045C991C"; //Invalid Address with capital C (should be lower case)

  const [
    creatorAddress, // used as stranger
    aliceAddress,
    bobAddress,
    carolAddress,
    newAddress //used to test change of address
  ] = accounts;

  beforeEach("create instance", async () => {
    splitterInstance = await Splitter.new(
      aliceAddress,
      bobAddress,
      carolAddress
    );
  });

  it("...has inital address address as " + bobAddress, async () => {
    const pulledAddress = await splitterInstance.bobAddress();
    assert.strictEqual(pulledAddress, bobAddress, "Invalid iniital address");
  });

  it("...prevent stranger from changing address", async () => {
    try {
      await splitterInstance.changeBobAddress(creatorAddress, {
        from: creatorAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to the same as Alices address", async () => {
    try {
      await splitterInstance.changeBobAddress(aliceAddress, {
        from: bobAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to the same as Carols address", async () => {
    try {
      await splitterInstance.changeBobAddress(carolAddress, {
        from: bobAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to the same address", async () => {
    try {
      await splitterInstance.changeBobAddress(bobAddress, { from: bobAddress });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to 0x0000000000000000000000000000000000000000", async () => {
    try {
      await splitterInstance.changeBobAddress(
        "0x0000000000000000000000000000000000000000",
        {
          from: bobAddress
        }
      );
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to the contract address", async () => {
    try {
      await splitterInstance.changeBobAddress(splitterInstance.address, {
        from: bobAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to an invalid address", async () => {
    try {
      await splitterInstance.changeBobAddress("NotAnAddress", {
        from: bobAddress
      });

      assert.fail("");
    } catch (err) {
      assert.include(err.message, "invalid address", "'");
    }
  });

  it("...prevents address being changed to an address with invlid checksum", async () => {
    try {
      await splitterInstance.changeBobAddress(invalidChecksumAddress, {
        from: bobAddress
      });

      assert.fail("");
    } catch (err) {
      assert.include(err.message, "invalid address", "'");
    }
  });

  it("...allows change of address", async () => {
    await splitterInstance.changeBobAddress(newAddress, {
      from: bobAddress
    });

    const pulledBobAddress = await splitterInstance.bobAddress();

    assert.strictEqual(pulledBobAddress, newAddress, "Address was not changed");
  });
});

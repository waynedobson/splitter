const Splitter = artifacts.require("./Splitter.sol");

contract("Splitter features for Alice", accounts => {
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
    // return Splitter.new({ from: owner, gas: MAX_GAS });

    splitterInstance = await Splitter.new(
      aliceAddress,
      bobAddress,
      carolAddress,
      { from: creatorAddress }
    );
  });

  it("...has inital address address as " + aliceAddress, async () => {
    const pulledAddress = await splitterInstance.aliceAddress();
    assert.strictEqual(pulledAddress, aliceAddress, "Invalid iniital address");
  });

  it("...prevent stranger from changing address", async () => {
    try {
      await splitterInstance.changeAliceAddress(creatorAddress, {
        from: creatorAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to the same as Bobs address", async () => {
    try {
      await splitterInstance.changeAliceAddress(bobAddress, {
        from: aliceAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to the same as Carols address", async () => {
    try {
      await splitterInstance.changeAliceAddress(carolAddress, {
        from: aliceAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to the same address", async () => {
    try {
      await splitterInstance.changeAliceAddress(aliceAddress, {
        from: aliceAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to 0x0000000000000000000000000000000000000000", async () => {
    try {
      await splitterInstance.changeAliceAddress(
        "0x0000000000000000000000000000000000000000",
        {
          from: aliceAddress
        }
      );
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to the contract address", async () => {
    try {
      await splitterInstance.changeAliceAddress(splitterInstance.address, {
        from: aliceAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents Bobs address being changed to an invalid address", async () => {
    try {
      await splitterInstance.changeAliceAddress("NotAnAddress", {
        from: aliceAddress
      });

      assert.fail("");
    } catch (err) {
      assert.include(err.message, "invalid address", "'");
    }
  });

  it("...prevents address being changed to an address with invlid checksum", async () => {
    try {
      await splitterInstance.changeAliceAddress(invalidChecksumAddress, {
        from: aliceAddress
      });

      assert.fail("");
    } catch (err) {
      assert.include(err.message, "invalid address", "'");
    }
  });

  it("...allows change of address", async () => {
    await splitterInstance.changeAliceAddress(newAddress, {
      from: aliceAddress
    });

    const pulledAliceAddress = await splitterInstance.aliceAddress();

    assert.strictEqual(
      pulledAliceAddress,
      newAddress,
      "Address was not changed"
    );
  });
});

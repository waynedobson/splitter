const Splitter = artifacts.require("./Splitter.sol");

let splitterInstance;

contract("Splitter features for Carol", accounts => {
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
      carolAddress,
      { from: creatorAddress }
    );
  });

  it("...has inital address address as " + carolAddress, async () => {
    const pulledAddress = await splitterInstance.carolAddress();
    assert.strictEqual(pulledAddress, carolAddress, "Invalid iniital address");
  });

  it("...prevent stranger from changing address", async () => {
    try {
      await splitterInstance.changeCarolAddress(creatorAddress, {
        from: creatorAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to the same as Alices address", async () => {
    try {
      await splitterInstance.changeCarolAddress(aliceAddress, {
        from: carolAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to the same as Carols address", async () => {
    try {
      await splitterInstance.changeCarolAddress(carolAddress, {
        from: carolAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to the same address", async () => {
    try {
      await splitterInstance.changeCarolAddress(carolAddress, {
        from: carolAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to 0x0000000000000000000000000000000000000000", async () => {
    try {
      await splitterInstance.changeCarolAddress(
        "0x0000000000000000000000000000000000000000",
        {
          from: carolAddress
        }
      );
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to the contract address", async () => {
    try {
      await splitterInstance.changeCarolAddress(splitterInstance.address, {
        from: carolAddress
      });
      assert.fail("");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...prevents address being changed to an invalid address", async () => {
    try {
      await splitterInstance.changeCarolAddress("NotAnAddress", {
        from: carolAddress
      });

      assert.fail("");
    } catch (err) {
      assert.include(err.message, "invalid address", "'");
    }
  });

  it("...prevents address being changed to an address with invlid checksum", async () => {
    try {
      await splitterInstance.changeCarolAddress(invalidChecksumAddress, {
        from: carolAddress
      });

      assert.fail("");
    } catch (err) {
      assert.include(err.message, "invalid address", "'");
    }
  });

  it("...allows change of address", async () => {
    await splitterInstance.changeCarolAddress(newAddress, {
      from: carolAddress
    });

    const pulledCarolAddress = await splitterInstance.carolAddress();

    assert.strictEqual(
      pulledCarolAddress,
      newAddress,
      "Address was not changed"
    );
  });
});

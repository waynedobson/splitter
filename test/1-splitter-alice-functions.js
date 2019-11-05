const Splitter = artifacts.require("./Splitter.sol");

let splitterInstance;

contract("Splitter features for Alice", accounts => {
  const creatorAddress = accounts[0]; // 0x09774FDeF12B16A6E75ACDA7714d418516c32847 -  used as stranger
  const aliceAddress = accounts[1]; //0x695E0E26BAe141f014921c12C92D45fF845bf32c
  const bobAddress = accounts[2]; // 0xE75e73F417930F23eAd63180A05E132aF97b39e5
  const carolAddress = accounts[3]; // 0xb1885953430884544Bc205A90A6e2c810d433013
  const newAddress = accounts[4]; // 0xA418e0F0CB8Aa8A907Bf975f0Ad4D15366D9a4C0 - used to test change of address
  const invalidChecksumAddress = "0x31fC3D52f842E70deA4F990e4CfcAFa4045C991C"; //Invalid Address with capital C (should be lower case)

  beforeEach(async () => {
    splitterInstance = await Splitter.new(
      aliceAddress,
      bobAddress,
      carolAddress
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

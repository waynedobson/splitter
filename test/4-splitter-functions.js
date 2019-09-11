const Splitter = artifacts.require("./Splitter.sol");

let splitterInstance;

const creatorAddress = "0x09774FDeF12B16A6E75ACDA7714d418516c32847"; // used as stranger
const aliceAddress = "0x695E0E26BAe141f014921c12C92D45fF845bf32c";
const bobAddress = "0xE75e73F417930F23eAd63180A05E132aF97b39e5";
const carolAddress = "0xb1885953430884544Bc205A90A6e2c810d433013";
const newAddress = "0xA418e0F0CB8Aa8A907Bf975f0Ad4D15366D9a4C0"; // used to test change of address
const invalidChecksumAddress = "0x31fC3D52f842E70deA4F990e4CfcAFa4045C991C"; //newAddress with capital C
let splitterAddress;

before(async () => {
  splitterInstance = await Splitter.deployed();
  splitterAddress = splitterInstance.address;
});

contract("Splitter features", accounts => {
  it("...contract has an initial zero ETH balance", async () => {
    const balance = await web3.eth.getBalance(splitterInstance.address);

    assert.equal(balance, 0, "Contract had a balance of ETH before send");
  });

  it("...returns ETH sent to contract", async () => {
    const balance = await web3.eth.getBalance(splitterInstance.address);

    await web3.eth.sendTransaction({
      from: aliceAddress,
      to: splitterAddress,
      value: "1000000000000000000"
    });

    const newbalance = await web3.eth.getBalance(splitterInstance.address);

    assert.equal(newbalance, 0, "Contract had a balance of ETH before send");
  });

  it("...rejects odd amounts to split", async () => {
    try {
      await splitterInstance.split({
        from: aliceAddress,
        value: 1
      });

      assert.fail("Odd value accepted");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...splits between Bob and Carol", async () => {
    await splitterInstance.split({
      from: aliceAddress,
      value: 10
    });

    const bobBalance = await splitterInstance.bobBalance();
    const carolBalance = await splitterInstance.carolBalance();

    if (bobBalance != 5 || carolBalance != 5) {
      assert.fail("amount was not allocated correctly");
    }
  });

  it("...rejects zero send from Alice", async () => {
    try {
      await splitterInstance.split({
        from: aliceAddress,
        value: 0
      });

      assert.fail("zero value accepted");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...rejects if Alice is not the sender", async () => {
    try {
      await splitterInstance.split({
        from: bobAddress,
        value: 2
      });

      assert.fail("Allowed none Alice address to send");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...only allows Bob or Carol to withdraw", async () => {
    try {
      await splitterInstance.withdraw({
        from: aliceAddress
      });

      assert.fail("Did not reject none Bob/Carol address in withdraw");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }

    await splitterInstance.withdraw({
      from: bobAddress
    });

    await splitterInstance.withdraw({
      from: carolAddress
    });
  });

  it("...allows Bob to withdraw 5 ETH (Allowing for Gas)", async () => {
    const bobStartBalance = await splitterInstance.bobBalance();
    const bobETHStartBalance = new web3.utils.BN(
      await web3.eth.getBalance(bobAddress)
    );

    await splitterInstance.split({
      from: aliceAddress,
      value: "10000000000000000000"
    });

    const bobMidBalance = await splitterInstance.bobBalance();
    const bobETHMidbalance = new web3.utils.BN(
      await web3.eth.getBalance(bobAddress)
    );

    await splitterInstance.withdraw({
      from: bobAddress
    });

    const bobEndBalance = await splitterInstance.bobBalance();
    const bobETHEndBalance = new web3.utils.BN(
      await web3.eth.getBalance(bobAddress)
    );

    const bobDiffETH = bobETHEndBalance.sub(bobETHStartBalance);
    const gasUsed = bobMidBalance.sub(bobDiffETH);
    const allowedGas = new web3.utils.BN("50000000000000"); // if used more than this something is wrong

    assert(allowedGas.lt(gasUsed), "Bob did not get enough ETH form the 5 ETH");
    assert(bobEndBalance.isZero, "Bob still had balance on splitter");
  });

  it("...allows Carol to withdraw 5 ETH (Allowing for Gas)", async () => {
    const carolStartBalance = await splitterInstance.carolBalance();
    const carolETHStartBalance = new web3.utils.BN(
      await web3.eth.getBalance(carolAddress)
    );

    await splitterInstance.split({
      from: aliceAddress,
      value: "10000000000000000000"
    });

    const carolMidBalance = await splitterInstance.carolBalance();
    const carolETHMidbalance = new web3.utils.BN(
      await web3.eth.getBalance(carolAddress)
    );

    await splitterInstance.withdraw({
      from: carolAddress
    });

    const carolEndBalance = await splitterInstance.carolBalance();
    const carolETHEndBalance = new web3.utils.BN(
      await web3.eth.getBalance(carolAddress)
    );

    const carolDiffETH = carolETHEndBalance.sub(carolETHStartBalance);
    const gasUsed = carolMidBalance.sub(carolDiffETH);
    const allowedGas = new web3.utils.BN("50000000000000"); // if used more than this something is wrong

    assert(
      allowedGas.lt(gasUsed),
      "carol did not get enough ETH form the 5 ETH"
    );
    assert(carolEndBalance.isZero, "carol still had balance on splitter");
  });
});
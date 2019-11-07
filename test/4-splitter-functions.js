const Splitter = artifacts.require("./Splitter.sol");

let splitterInstance;
let splitterAddress;

contract("Splitter features", accounts => {
  const invalidChecksumAddress = "0x31fC3D52f842E70deA4F990e4CfcAFa4045C991C"; //Invalid Address with capital C (should be lower case)

  const [
    creatorAddress, // used as stranger
    aliceAddress,
    bobAddress,
    carolAddress,
    newAddress //used to test change of address
  ] = accounts;

  const { BN, toWei } = web3.utils;

  beforeEach("create instance", async () => {
    splitterInstance = await Splitter.new(
      aliceAddress,
      bobAddress,
      carolAddress
    );
    splitterAddress = splitterInstance.address;
  });

  it("...contract has an initial zero ETH balance", async () => {
    const balance = await web3.eth.getBalance(splitterInstance.address);

    assert.strictEqual(
      balance,
      "0",
      "Contract had a balance of ETH before send"
    );
  });

  it("...has not fallbackfunction", async () => {
    try {
      await web3.eth.sendTransaction({
        from: aliceAddress,
        to: splitterAddress,
        value: toWei("0.1", "ether")
      });

      assert.fail("Allowed fallback call");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...gives odd amounts to Alice", async () => {
    const startBalance = await splitterInstance.aliceBalance();

    await splitterInstance.split({
      from: aliceAddress,
      value: 3
    });

    const endBalance = await splitterInstance.aliceBalance();

    assert(
      startBalance.add(new BN(1)).eq(endBalance),
      "Alice not given the odd amount"
    );
  });

  it("...splits between Bob and Carol", async () => {
    await splitterInstance.split({
      from: aliceAddress,
      value: 10
    });

    const bobBalance = await splitterInstance.bobBalance();
    const carolBalance = await splitterInstance.carolBalance();

    assert.notEqual(bobBalance, new BN(5));
    assert.notEqual(carolBalance, new BN(5));
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

  it("...only allows Alice, Bob or Carol to withdraw", async () => {
    try {
      await splitterInstance.withdraw({
        from: creatorAddress
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

  it("...allows Bob to withdraw 0.05 ETH (Allowing for Gas)", async () => {
    const startBalance = new BN(await web3.eth.getBalance(bobAddress));

    await splitterInstance.split({
      from: aliceAddress,
      value: toWei("0.1", "ether")
    });

    let txobj = await splitterInstance.withdraw({
      from: bobAddress
    });

    const gasUsed = new BN(txobj.receipt.gasUsed);
    const gasPrice = new BN(await web3.eth.getGasPrice());
    const allowedGas = new BN(gasPrice).mul(gasUsed);

    const endBalance = new BN(await web3.eth.getBalance(bobAddress));

    assert.strictEqual(
      endBalance.toString(10),
      startBalance
        .add(new BN(toWei("0.05", "ether")))
        .sub(allowedGas)
        .toString(10),
      "Bob did not get enough ETH form the 0.05 ETH"
    );
  });

  it("...allows Carol to withdraw 0.05 ETH (Allowing for Gas)", async () => {
    const startBalance = new BN(await web3.eth.getBalance(carolAddress));

    await splitterInstance.split({
      from: aliceAddress,
      value: toWei("0.1", "ether")
    });

    let txobj = await splitterInstance.withdraw({
      from: carolAddress
    });

    const gasUsed = new BN(txobj.receipt.gasUsed);
    const gasPrice = new BN(await web3.eth.getGasPrice());
    const allowedGas = new BN(gasPrice).mul(gasUsed);

    const endBalance = new BN(await web3.eth.getBalance(carolAddress));

    assert.strictEqual(
      endBalance.toString(10),
      startBalance
        .add(new BN(toWei("0.05", "ether")))
        .sub(allowedGas)
        .toString(10),
      "Carol did not get enough ETH form the 0.05 ETH"
    );
  });

  it("...allows Bob to withdraw 0.05 ETH and then checks that 0 is left", async () => {
    const bobStartBalance = await splitterInstance.bobBalance();
    const bobETHStartBalance = new BN(await web3.eth.getBalance(bobAddress));

    await splitterInstance.split({
      from: aliceAddress,
      value: toWei("0.1", "ether")
    });

    const bobMidBalance = await splitterInstance.bobBalance();
    const bobETHMidbalance = new BN(await web3.eth.getBalance(bobAddress));

    await splitterInstance.withdraw({
      from: bobAddress
    });

    const bobEndBalance = await splitterInstance.bobBalance();

    assert(bobEndBalance.isZero, "Bob still had balance on splitter");
  });

  it("...allows Carol to withdraw 0.05 ETH and then checks that 0 is left", async () => {
    const carolStartBalance = await splitterInstance.carolBalance();
    const carolETHStartBalance = new BN(
      await web3.eth.getBalance(carolAddress)
    );

    await splitterInstance.split({
      from: aliceAddress,
      value: toWei("0.1", "ether")
    });

    const carolMidBalance = await splitterInstance.carolBalance();
    const carolETHMidbalance = new BN(await web3.eth.getBalance(carolAddress));

    await splitterInstance.withdraw({
      from: carolAddress
    });

    const carolEndBalance = await splitterInstance.carolBalance();

    assert(carolEndBalance.isZero, "carol still had balance on splitter");
  });

  it("...emits LogSplit event", async () => {
    txObj = await splitterInstance.split({
      from: aliceAddress,
      value: toWei("0.1", "ether")
    });

    assert.strictEqual(
      txObj.receipt.logs[0].event,
      "LogSplit",
      "LogSplit not emitted"
    );
  });

  it("...emits LogWithdraw event", async () => {
    await splitterInstance.split({
      from: aliceAddress,
      value: toWei("0.1", "ether")
    });

    txObj = await splitterInstance.withdraw({
      from: carolAddress
    });

    assert.strictEqual(
      txObj.receipt.logs[0].event,
      "LogWithdraw",
      "LogWithdraw not emitted"
    );
  });

  it("...emits LogChangeAddress event", async () => {
    txObj = await splitterInstance.changeBobAddress(newAddress, {
      from: bobAddress
    });

    assert.strictEqual(
      txObj.receipt.logs[0].event,
      "LogChangeAddress",
      "LogChangeAddress not emitted"
    );
  });
});

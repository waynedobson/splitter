const Splitter = artifacts.require("./Splitter.sol");

contract("Splitter features", accounts => {
  let splitterInstance;
  let splitterAddress;

  const invalidChecksumAddress = "0x31fC3D52f842E70deA4F990e4CfcAFa4045C991C"; //Invalid Address with capital C (should be lower case)

  const [creator, sender, receiver1, receiver2] = accounts;

  const { BN, toWei } = web3.utils;

  beforeEach("create instance", async function() {
    splitterInstance = await Splitter.new({ from: creator });
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

  it("...has no fallbackfunction", async function() {
    try {
      await web3.eth.sendTransaction({
        from: sender,
        to: splitterAddress,
        value: toWei("0.1", "ether")
      });

      assert.fail("Allowed fallback call");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...gives odd amounts to sender", async function() {
    const startBalance = await splitterInstance.accounts(sender);

    await splitterInstance.split(receiver1, receiver2, {
      from: sender,
      value: 3
    });

    const endBalance = await splitterInstance.accounts(sender);

    assert(
      startBalance.add(new BN(1)).eq(endBalance),
      "sender not given the odd amount"
    );
  });

  it("...splits between receiver1 and receiver2", async function() {
    await splitterInstance.split(receiver1, receiver2, {
      from: sender,
      value: 10
    });

    const receiver1Balance = await splitterInstance.accounts(receiver1);
    const receiver2Balance = await splitterInstance.accounts(receiver2);

    assert.notEqual(receiver1Balance, new BN(5));
    assert.notEqual(receiver2Balance, new BN(5));
  });

  it("...rejects zero send from sender", async function() {
    try {
      await splitterInstance.split(receiver1, receiver2, {
        from: sender,
        value: 0
      });

      assert.fail("zero value accepted");
    } catch (err) {
      assert.include(err.message, "revert", "");
    }
  });

  it("...emits LogSplit event", async function() {
    const txObj = await splitterInstance.split(receiver1, receiver2, {
      from: sender,
      value: toWei("0.1", "ether")
    });

    assert.strictEqual(
      txObj.receipt.logs.length,
      1,
      "There should be one event emitted"
    );

    assert.strictEqual(
      txObj.receipt.logs[0].args["0"],
      sender,
      "LogWithdraw emitted with incorrect sender address"
    );

    assert.strictEqual(
      txObj.receipt.logs[0].args[1].toString(),
      toWei("0.1", "ether"),
      "LogWithdraw emitted with incorrect amount"
    );

    assert.strictEqual(
      txObj.receipt.logs[0].args[2],
      receiver1,
      "LogWithdraw emitted with incorrect receiver1 address"
    );

    assert.strictEqual(
      txObj.receipt.logs[0].args[3],
      receiver2,
      "LogWithdraw emitted with incorrect receiver2 address"
    );

    assert.strictEqual(
      txObj.receipt.logs[0].event,
      "LogSplit",
      "LogSplit not emitted"
    );
  });

  it("...allows receiver to withdraw 0.05 ETH (Allowing for Gas)", async function() {
    const startBalance = new BN(await web3.eth.getBalance(receiver1));

    await splitterInstance.split(receiver1, receiver2, {
      from: sender,
      value: toWei("0.1", "ether")
    });

    const txobj = await splitterInstance.withdraw({
      from: receiver1,
      gasPrice: 50
    });

    const tx = await web3.eth.getTransaction(txobj.tx);
    const gasPrice = new BN(tx.gasPrice);

    const gasUsed = new BN(txobj.receipt.gasUsed);
    const allowedGas = gasPrice.mul(gasUsed);

    const endBalance = new BN(await web3.eth.getBalance(receiver1));

    assert.strictEqual(
      endBalance.toString(10),
      startBalance
        .add(new BN(toWei("0.05", "ether")))
        .sub(allowedGas)
        .toString(10),
      "receiver1 did not get enough ETH form the 0.05 ETH"
    );
  });

  it("...allows receiver to withdraw 0.05 ETH and then checks that 0 is left", async function() {
    const startBalance = await splitterInstance.accounts(receiver1);
    // const bobETHStartBalance = new BN(await web3.eth.getBalance(bobAddress));

    await splitterInstance.split(receiver1, receiver2, {
      from: sender,
      value: toWei("0.1", "ether")
    });

    const midBalance = await splitterInstance.accounts(receiver1);

    await splitterInstance.withdraw({
      from: receiver1
    });

    const endBalance = await splitterInstance.accounts(receiver1);

    assert(endBalance.isZero, "Receiver still had balance on splitter");
  });

  it("...emits LogWithdraw event", async function() {
    await splitterInstance.split(receiver1, receiver2, {
      from: sender,
      value: toWei("0.1", "ether")
    });

    const txObj = await splitterInstance.withdraw({
      from: receiver1
    });

    assert.strictEqual(
      txObj.receipt.logs.length,
      1,
      "There should be one event emitted"
    );

    assert.strictEqual(
      txObj.receipt.logs[0].args[0],
      receiver1,
      "LogWithdraw emitted with incorrect address"
    );

    assert.strictEqual(
      txObj.receipt.logs[0].args[1].toString(),
      toWei("0.05", "ether").toString(),
      "LogWithdraw emitted with incorrect withdrawal amount"
    );

    assert.strictEqual(
      txObj.receipt.logs[0].event,
      "LogWithdraw",
      "LogWithdraw not emitted"
    );
  });
});

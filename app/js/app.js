import Web3 from "web3";
import $ from "jquery";
import splitterJson from "../../build/contracts/Splitter.json";
import truffleContract from "truffle-contract";

window.App = {
  start: async function() {
    let deployed;

    try {
      const networkId = await this.web3.eth.net.getId();
      const deployedNetwork = splitterJson.networks[networkId];
      const Splitter = truffleContract(splitterJson);

      Splitter.setProvider(App.web3.currentProvider);

      this.deployed = await Splitter.deployed();
    } catch (error) {
      alert(error);
    }
  },
  setAccount: async function(selectedAccount) {
    const accounts = await this.web3.eth.getAccounts();

    $("#ethAddress").val(accounts[selectedAccount].toString());
    App.refreshBalance();
  },
  refreshBalance: async function() {
    const address = $("#ethAddress").val();

    const splitterBalance = this.web3.utils.fromWei(
      await this.deployed.accounts(address),
      "ether"
    );

    const ethBalance = this.web3.utils.fromWei(
      await this.web3.eth.getBalance(address),
      "ether"
    );

    $("#splitterBalance").html(splitterBalance.toString());
    $("#ethBalance").html(ethBalance.toString());
  },
  split: async function() {
    $("#ethAddress").val();

    const amount = this.web3.utils.toWei($("#amount").val(), "ether");

    const receiver1 = $("#receiver1").val();
    const receiver2 = $("#receiver2").val();
    const sender = $("#ethAddress").val();

    try {
      await this.deployed
        .split(receiver1, receiver2, {
          from: sender,
          value: amount
        })
        .on("transactionHash", txHash => {
          alert(
            "Transaction pending, you can use this hash to look it up: " +
              txHash
          );
        })
        .on("confirmation", async (confNumber, receipt) => {
          if (confNumber == 1) {
            alert("Your deposit has been confirmed on the blockchain!");
          }
          this.refreshBalance();
        });
    } catch (error) {
      alert(error);
    }
  },
  withdrawFunds: async function() {
    try {
      const address = $("#ethAddress").val();

      await this.deployed
        .withdraw({
          from: address
        })
        .on("transactionHash", txHash => {
          alert(
            "Transaction pending, you can use this hash to look it up: " +
              txHash
          );
        })
        .on("confirmation", async (confNumber, receipt) => {
          if (confNumber == 1) {
            alert("Your withdrawal has been confirmed on the blockchain!");
          }
          this.refreshBalance();
        });
    } catch (error) {
      alert(error);
    }
  }
};

window.addEventListener("load", function() {
  const devMode = true;

  if (window.ethereum && !devMode) {
    App.web3 = new Web3(currentProvider);
    window.ethereum.enable();
  } else {
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://localhost:7545")
    );
  }

  App.start();
});

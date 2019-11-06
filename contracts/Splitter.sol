pragma solidity 0.5.11;

import "./math/SafeMath.sol";
import "./lifecycle/Pausable.sol";

contract Splitter is Pausable{
  using SafeMath for uint256;

  address public aliceAddress;
  address public bobAddress;
  address public carolAddress;

//consider using mapping if more than 2
  uint public aliceBalance;
  uint public bobBalance;
  uint public carolBalance;

  event LogSplit(address indexed aliceCurrentAddress, uint value);
  event LogWithdraw(address indexed withdranToAddress, uint value);
  event LogChangeAddress(address indexed formAddress, address indexed toAddress);

  modifier rejectInvalidAddresses(address _addressToChange, address _newAddress) {
    require(msg.sender == _addressToChange, "Cannot change to same address.");
    require(aliceAddress != _newAddress, "Cannot change to Alices address.");
    require(bobAddress != _newAddress, "Cannot change to Bobs address.");
    require(carolAddress != _newAddress, "Cannot change to Carols Address.");
    require(address(0x0) != _newAddress, "Cannot change to 0x0 Address.");
    require(address(this) != _newAddress, "Cannot change to Contract Address.");
    emit LogChangeAddress(msg.sender, _newAddress);
    _;
  }

  constructor (address _aliceAddress, address _bobAddress, address _carolAddress) public {
    require(address(0x0) != _aliceAddress, "Alice address cannot be set to 0x0.");
    require(address(0x0) != _bobAddress, "Bob address cannot be set to 0x0.");
    require(address(0x0) != _carolAddress, "Carol address cannot be set to 0x0.");
    aliceAddress = _aliceAddress;
    bobAddress = _bobAddress;
    carolAddress = _carolAddress;
  }

  function () external {
    revert("No fallback function");
  }

  function split() public payable whenNotPaused{
    require (msg.value > 0, "No ETH was sent to split");
    require (msg.sender == aliceAddress, "Only Alice can send");

    bobBalance = bobBalance.add(msg.value.div(2));
    carolBalance = carolBalance.add(msg.value.div(2));
    aliceBalance = aliceBalance.add(msg.value.mod(2));

    emit LogSplit(msg.sender, msg.value);
  }

  function withdraw() public whenNotPaused{
    require(msg.sender == aliceAddress || msg.sender == bobAddress || msg.sender == carolAddress, "Only Alice, Bob or Carol can withdraw");

    if (msg.sender == aliceAddress) {
      uint value = aliceBalance;
      aliceBalance = 0;
      emit LogWithdraw(msg.sender,value);
      msg.sender.transfer(value);
    } else { if (msg.sender == bobAddress) {
        uint value = bobBalance;
        bobBalance = 0;
        emit LogWithdraw(msg.sender,value);
        msg.sender.transfer(value);
        } else { if (msg.sender == carolAddress) {
          uint value = carolBalance;
          carolBalance = 0;
          emit LogWithdraw(msg.sender,value);
          msg.sender.transfer(value);
        }
      }
    }
  }

  function changeAliceAddress(address _newAddress) public whenNotPaused rejectInvalidAddresses (aliceAddress, _newAddress){
    aliceAddress = _newAddress;
  }

  function changeBobAddress(address _newAddress) public whenNotPaused rejectInvalidAddresses (bobAddress, _newAddress){
    bobAddress = _newAddress;
  }

  function changeCarolAddress(address _newAddress) public whenNotPaused rejectInvalidAddresses (carolAddress, _newAddress){
    carolAddress = _newAddress;
  }
}

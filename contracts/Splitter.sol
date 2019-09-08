pragma solidity 0.5.11;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/lifecycle/Pausable.sol";

contract Splitter is Pausable{
  using SafeMath for uint256;

  address public aliceAddress;
  address public bobAddress;
  address public carolAddress;

//consider using mapping if more than 2
  uint public bobBalance;
  uint public carolBalance;

  event LogSplit(address indexed aliceCurrentAddress, uint value);
  event LogWithdraw(address indexed withdranToAddress, uint value);
  event LogChangeAddress(address indexed formAddress, address indexed toAddress);

  modifier rejectInvalidAddresses(address _addressToChange, address _newAddress) {
    require(msg.sender == _addressToChange);
    require(aliceAddress != _newAddress);
    require(bobAddress != _newAddress);
    require(carolAddress != _newAddress);
    require(address(0x0) != _newAddress);
    require(address(this) != _newAddress);
    emit LogChangeAddress(msg.sender, _newAddress);
    _;
  }

  constructor (address _aliceAddress, address _bobAddress, address _carolAddress) public {
    aliceAddress = _aliceAddress;
    bobAddress = _bobAddress;
    carolAddress = _carolAddress;
  }

  function () external payable {
    require (msg.value > 0);
    msg.sender.transfer(msg.value);
  }

  function split() public payable whenNotPaused{
    require (msg.value.mod(2) == 0); // reject odd amounts (Alice should know better)
    require (msg.value > 0);
    require (msg.sender == aliceAddress);

    bobBalance = bobBalance.add(msg.value.div(2));
    carolBalance = carolBalance.add(msg.value.div(2));

    emit LogSplit(msg.sender, msg.value);
  }

  function withdraw() public whenNotPaused{
    require(msg.sender == bobAddress || msg.sender == carolAddress);

    if (msg.sender == bobAddress) {
      uint value = bobBalance;
      bobBalance = 0;
      msg.sender.transfer(value);
      emit LogWithdraw(msg.sender,value);
    }

    if (msg.sender == carolAddress) {
      uint value = carolBalance;
      carolBalance = 0;
      msg.sender.transfer(value);
      emit LogWithdraw(msg.sender,value);
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

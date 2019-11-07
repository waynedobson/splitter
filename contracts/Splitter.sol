pragma solidity 0.5.11;

import "./math/SafeMath.sol";
import "./lifecycle/Pausable.sol";

contract Splitter is Pausable{
  using SafeMath for uint256;

  mapping(address => uint) public accounts;

  event LogSplit(address indexed senderAddress, uint value, address receiver1, address receiver2);
  event LogWithdraw(address indexed withdrawalAddress, uint value);

  constructor () public {
  }

  function () external {
    revert("No fallback function");
  }

  function split(address receiver1, address receiver2) public payable whenNotPaused{
    require (msg.value > 0, "No ETH was sent to split");
    require(receiver1 != address(0) && receiver2 != address(0), '0x is not valid Receiver');
    require(msg.sender != receiver1 && msg.sender != receiver2, 'Sender cannot be one of receivers'); // subject to spec (assumption made here)

    uint value = msg.value.div(2);
    accounts[msg.sender] = accounts[msg.sender].add(msg.value.mod(2)); // catch odd amounts
    accounts[receiver1] = accounts[receiver1].add(value);
    accounts[receiver2] = accounts[receiver2].add(value);

    emit LogSplit(msg.sender, msg.value, receiver1, receiver2);
  }

  function withdraw() public whenNotPaused{

    uint value = accounts[msg.sender];
    require(value > 0, 'Cannot withdraw zero');

    accounts[msg.sender] = 0;
    emit LogWithdraw(msg.sender, value);

    msg.sender.transfer(value);
  }
}

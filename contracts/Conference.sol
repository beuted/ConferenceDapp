pragma solidity ^0.4.18;

contract Conference { 
  address public organizer;
  mapping (address => uint) public registrantsPaid;
  uint public numRegistrants;
  uint public quota;
  // so you can log these events
  event Deposit(address _from, uint _amount); 
  event Refund(address _to, uint _amount);

  function Conference() public { // Constructor
    organizer = msg.sender;
    quota = 500;
    numRegistrants = 0;
  }

  function buyTicket() public payable returns (bool success) { 
     require(numRegistrants < quota);
     registrantsPaid[msg.sender] = msg.value;
     numRegistrants++;
     Deposit(msg.sender, msg.value);
     return true;
  }

  function changeQuota(uint newquota) public {
    if (msg.sender != organizer) { return; }
    quota = newquota;
  }

  function refundTicket(address recipient) public {
    if (msg.sender != organizer) { return; }
    uint amount = registrantsPaid[recipient];
    address contractAddress = this;
    if (contractAddress.balance >= amount) {
      recipient.transfer(amount);
      registrantsPaid[recipient] = 0;
      numRegistrants--;
      Refund(recipient, amount);
    }
  }

  function destroy() public { // so funds not locked in contract forever
    if (msg.sender == organizer) {
      selfdestruct(organizer); // send funds to organizer
    }
  }
}
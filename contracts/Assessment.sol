// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function calculateEstimatedInvestmentAmount(uint256 goldQuantity) public pure returns (uint256) {
        uint256 pricePerGram = 50000; // Price of 10 grams of gold in INR
        uint256 investment = (goldQuantity / 10) * pricePerGram; // Convert grams to 10 gram units
        return investment;
    }

    function calculateProfit(uint256 investmentAmount, uint256 numYears) public pure returns (uint256) {
        uint256 interestRate = 25; // 2.5% interest rate
        uint256 returnAmount = investmentAmount * ((100 + interestRate) ** numYears) / 100 - investmentAmount;
        return returnAmount;
    }

    function applyDiscount(uint256 investmentAmount, bool isOnlinePayment) public pure returns (uint256) {
        uint256 discount = isOnlinePayment ? 100 : 0;
        return investmentAmount - discount;
    }
}

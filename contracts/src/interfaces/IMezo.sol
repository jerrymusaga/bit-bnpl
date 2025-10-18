// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IMezoVault {
    function deposit(uint256 amount) external payable;
    function withdraw(uint256 amount) external;
    function getBorrowingCapacity(address user) external view returns (uint256);
    function getCollateral(address user) external view returns (uint256);
    function getDebt(address user) external view returns (uint256);
}

interface IMUSDBorrowing {
    function borrow(uint256 amount) external;
    function repay(uint256 amount) external;
    function getDebt(address user) external view returns (uint256);
}

interface IMUSD {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

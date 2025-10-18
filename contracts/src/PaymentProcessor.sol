// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./interfaces/IMezo.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PaymentProcessor is Ownable, ReentrancyGuard {
    IMezoVault public immutable mezoVault;
    IMUSDBorrowing public immutable mezdoBorrowing;
    IMUSD public immutable musd;

    uint256 public platformFee = 250; // 2.5% (basis points)
    uint256 public constant FEE_DENOMINATOR = 10000;

    struct Payment {
        address buyer;
        address merchant;
        uint256 amount;
        string orderId;
        uint256 timestamp;
        PaymentStatus status;
        PaymentType paymentType;
    }

    enum PaymentStatus {
        Pending,
        Completed,
        Failed,
        Refunded
    }
    enum PaymentType {
        OneTime,
        Subscription,
        InGame,
        CreatorSupport
    }

    mapping(bytes32 => Payment) public payments;
    mapping(address => uint256) public merchantBalances;
    mapping(address => bytes32[]) public userPayments;
    mapping(address => bytes32[]) public merchantPayments;

    event PaymentProcessed(
        bytes32 indexed paymentId,
        address indexed buyer,
        address indexed merchant,
        uint256 amount,
        PaymentType paymentType
    );

    event PaymentRefunded(bytes32 indexed paymentId, uint256 amount);
    event MerchantWithdrawal(address indexed merchant, uint256 amount);
    event PlatformFeeUpdated(uint256 newFee);

    constructor(address _mezoVault, address _mezoBorrowing, address _musd) Ownable(msg.sender) {
        mezoVault = IMezoVault(_mezoVault);
        mezdoBorrowing = IMUSDBorrowing(_mezoBorrowing);
        musd = IMUSD(_musd);
    }

    function processPayment(address merchant, uint256 amount, string memory orderId, PaymentType paymentType)
        external
        nonReentrant
        returns (bytes32)
    {
        require(merchant != address(0), "Invalid merchant");
        require(amount > 0, "Amount must be > 0");

        // Check borrowing capacity
        uint256 capacity = mezoVault.getBorrowingCapacity(msg.sender);
        require(capacity >= amount, "Insufficient collateral");

        // Borrow MUSD from Mezo
        mezdoBorrowing.borrow(amount);

        // Calculate fees
        uint256 fee = (amount * platformFee) / FEE_DENOMINATOR;
        uint256 merchantAmount = amount - fee;

        // Transfer MUSD to contract
        require(musd.transferFrom(msg.sender, address(this), amount), "MUSD transfer failed");

        // Update merchant balance
        merchantBalances[merchant] += merchantAmount;

        // Create payment record
        bytes32 paymentId = keccak256(abi.encodePacked(msg.sender, merchant, orderId, block.timestamp));

        payments[paymentId] = Payment({
            buyer: msg.sender,
            merchant: merchant,
            amount: amount,
            orderId: orderId,
            timestamp: block.timestamp,
            status: PaymentStatus.Completed,
            paymentType: paymentType
        });

        userPayments[msg.sender].push(paymentId);
        merchantPayments[merchant].push(paymentId);

        emit PaymentProcessed(paymentId, msg.sender, merchant, amount, paymentType);

        return paymentId;
    }

    function merchantWithdraw() external nonReentrant {
        uint256 balance = merchantBalances[msg.sender];
        require(balance > 0, "No balance");

        merchantBalances[msg.sender] = 0;
        require(musd.transfer(msg.sender, balance), "Transfer failed");

        emit MerchantWithdrawal(msg.sender, balance);
    }

    function refundPayment(bytes32 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.merchant == msg.sender, "Not merchant");
        require(payment.status == PaymentStatus.Completed, "Cannot refund");

        uint256 fee = (payment.amount * platformFee) / FEE_DENOMINATOR;
        uint256 merchantAmount = payment.amount - fee;

        payment.status = PaymentStatus.Refunded;
        merchantBalances[msg.sender] -= merchantAmount;

        require(musd.transfer(payment.buyer, payment.amount), "Refund failed");

        emit PaymentRefunded(paymentId, payment.amount);
    }

    // View functions
    function getUserPayments(address user) external view returns (bytes32[] memory) {
        return userPayments[user];
    }

    function getMerchantPayments(address merchant) external view returns (bytes32[] memory) {
        return merchantPayments[merchant];
    }

    // Admin functions
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = musd.balanceOf(address(this));
        uint256 totalMerchantBalances = 0;

        // Calculate total merchant balances (simplified, should cache this)
        // In production, track this separately

        require(musd.transfer(owner(), balance), "Withdrawal failed");
    }
}

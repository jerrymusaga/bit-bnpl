// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title InstallmentProcessor
 * @notice Handles BNPL installment payments for BitBNPL platform
 * @dev Platform fronts payment to merchants, users pay back in bi-weekly installments
 */
contract InstallmentProcessor is Ownable, ReentrancyGuard {
    IERC20 public immutable MUSD;

    // Payment intervals (2 weeks in seconds)
    uint256 public constant PAYMENT_INTERVAL = 2 weeks;
    uint256 public constant GRACE_PERIOD = 1 weeks;
    uint256 public constant LATE_FEE_PERCENTAGE = 100; // 1% (in basis points)
    uint256 public constant BASIS_POINTS = 10000;

    struct Purchase {
        address user;
        address merchant;
        uint256 totalAmount;        // Total purchase amount
        uint256 totalWithInterest;  // Total including interest
        uint256 amountPerPayment;   // Amount per installment
        uint8 paymentsTotal;        // Total number of payments
        uint8 paymentsRemaining;    // Payments left
        uint256 nextPaymentDue;     // Timestamp of next payment
        uint256 collateralLocked;   // Amount of collateral locked
        uint256 lateFees;           // Accumulated late fees
        bool isActive;              // Whether purchase is active
    }

    // Platform's MUSD liquidity pool
    uint256 public liquidityPool;

    // User purchases mapping: user => purchaseId => Purchase
    mapping(address => mapping(uint256 => Purchase)) public userPurchases;
    mapping(address => uint256) public userPurchaseCount;

    // Interest rates per installment plan (in basis points)
    mapping(uint8 => uint256) public interestRates;

    // Events
    event PurchaseCreated(
        address indexed user,
        uint256 indexed purchaseId,
        address merchant,
        uint256 amount,
        uint8 installments
    );

    event PaymentMade(
        address indexed user,
        uint256 indexed purchaseId,
        uint256 amount,
        uint8 paymentsRemaining
    );

    event PurchaseCompleted(
        address indexed user,
        uint256 indexed purchaseId
    );

    event LateFeeApplied(
        address indexed user,
        uint256 indexed purchaseId,
        uint256 feeAmount
    );

    event LiquidityDeposited(address indexed depositor, uint256 amount);
    event LiquidityWithdrawn(address indexed recipient, uint256 amount);

    constructor(address _musdAddress) Ownable(msg.sender) {
        MUSD = IERC20(_musdAddress);

        // Set interest rates (in basis points: 100 = 1%)
        interestRates[1] = 0;    // 0% for pay in full
        interestRates[4] = 50;   // 0.5% for 4 payments (8 weeks)
        interestRates[6] = 100;  // 1.0% for 6 payments (12 weeks)
        interestRates[8] = 150;  // 1.5% for 8 payments (16 weeks)
    }

    /**
     * @notice Deposit MUSD into liquidity pool
     * @param amount Amount of MUSD to deposit
     */
    function depositLiquidity(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(MUSD.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        liquidityPool += amount;
        emit LiquidityDeposited(msg.sender, amount);
    }

    /**
     * @notice Withdraw MUSD from liquidity pool
     * @param amount Amount of MUSD to withdraw
     */
    function withdrawLiquidity(uint256 amount) external onlyOwner {
        require(amount <= liquidityPool, "Insufficient liquidity");
        liquidityPool -= amount;

        require(MUSD.transfer(msg.sender, amount), "Transfer failed");
        emit LiquidityWithdrawn(msg.sender, amount);
    }

    /**
     * @notice Create a new installment purchase
     * @param merchant Address to receive payment
     * @param amount Purchase amount in MUSD
     * @param installments Number of installment payments (1, 4, 6, or 8)
     * @param userBorrowingCapacity User's available borrowing capacity from Mezo
     */
    function createPurchase(
        address merchant,
        uint256 amount,
        uint8 installments,
        uint256 userBorrowingCapacity
    ) external nonReentrant returns (uint256) {
        require(merchant != address(0), "Invalid merchant");
        require(amount > 0, "Amount must be > 0");
        require(
            installments == 1 || installments == 4 || installments == 6 || installments == 8,
            "Invalid installments"
        );
        require(amount <= userBorrowingCapacity, "Insufficient borrowing capacity");
        require(amount <= liquidityPool, "Insufficient platform liquidity");

        // Calculate interest and total
        uint256 interest = (amount * interestRates[installments]) / BASIS_POINTS;
        uint256 totalWithInterest = amount + interest;
        uint256 amountPerPayment = totalWithInterest / installments;

        // Pay merchant instantly from liquidity pool
        liquidityPool -= amount;
        require(MUSD.transfer(merchant, amount), "Merchant payment failed");

        // Create purchase record
        uint256 purchaseId = userPurchaseCount[msg.sender];
        userPurchases[msg.sender][purchaseId] = Purchase({
            user: msg.sender,
            merchant: merchant,
            totalAmount: amount,
            totalWithInterest: totalWithInterest,
            amountPerPayment: amountPerPayment,
            paymentsTotal: installments,
            paymentsRemaining: installments,
            nextPaymentDue: block.timestamp + PAYMENT_INTERVAL,
            collateralLocked: amount,
            lateFees: 0,
            isActive: true
        });

        userPurchaseCount[msg.sender]++;

        emit PurchaseCreated(msg.sender, purchaseId, merchant, amount, installments);

        return purchaseId;
    }

    /**
     * @notice Make an installment payment
     * @param purchaseId ID of the purchase
     */
    function makePayment(uint256 purchaseId) external nonReentrant {
        Purchase storage purchase = userPurchases[msg.sender][purchaseId];
        require(purchase.isActive, "Purchase not active");
        require(purchase.paymentsRemaining > 0, "Already paid off");

        uint256 paymentAmount = purchase.amountPerPayment;

        // Add late fees if applicable
        if (block.timestamp > purchase.nextPaymentDue + GRACE_PERIOD) {
            uint256 lateFee = (paymentAmount * LATE_FEE_PERCENTAGE) / BASIS_POINTS;
            purchase.lateFees += lateFee;
            paymentAmount += lateFee;

            emit LateFeeApplied(msg.sender, purchaseId, lateFee);
        }

        // Transfer payment from user to platform
        require(
            MUSD.transferFrom(msg.sender, address(this), paymentAmount),
            "Payment transfer failed"
        );

        // Replenish liquidity pool
        liquidityPool += paymentAmount;

        // Update purchase state
        purchase.paymentsRemaining--;
        purchase.nextPaymentDue = block.timestamp + PAYMENT_INTERVAL;

        emit PaymentMade(msg.sender, purchaseId, paymentAmount, purchase.paymentsRemaining);

        // Mark as complete if all payments made
        if (purchase.paymentsRemaining == 0) {
            purchase.isActive = false;
            emit PurchaseCompleted(msg.sender, purchaseId);
        }
    }

    /**
     * @notice Get user's active purchases
     * @param user User address
     * @return Array of active purchase IDs
     */
    function getUserActivePurchases(address user) external view returns (uint256[] memory) {
        uint256 count = userPurchaseCount[user];
        uint256 activeCount = 0;

        // Count active purchases
        for (uint256 i = 0; i < count; i++) {
            if (userPurchases[user][i].isActive) {
                activeCount++;
            }
        }

        // Build array of active purchase IDs
        uint256[] memory activePurchases = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < count; i++) {
            if (userPurchases[user][i].isActive) {
                activePurchases[index] = i;
                index++;
            }
        }

        return activePurchases;
    }

    /**
     * @notice Get purchase details
     * @param user User address
     * @param purchaseId Purchase ID
     */
    function getPurchase(address user, uint256 purchaseId)
        external
        view
        returns (
            address merchant,
            uint256 totalAmount,
            uint256 totalWithInterest,
            uint256 amountPerPayment,
            uint8 paymentsTotal,
            uint8 paymentsRemaining,
            uint256 nextPaymentDue,
            uint256 lateFees,
            bool isActive
        )
    {
        Purchase storage purchase = userPurchases[user][purchaseId];
        return (
            purchase.merchant,
            purchase.totalAmount,
            purchase.totalWithInterest,
            purchase.amountPerPayment,
            purchase.paymentsTotal,
            purchase.paymentsRemaining,
            purchase.nextPaymentDue,
            purchase.lateFees,
            purchase.isActive
        );
    }

    /**
     * @notice Check if payment is late
     * @param user User address
     * @param purchaseId Purchase ID
     */
    function isPaymentLate(address user, uint256 purchaseId) external view returns (bool) {
        Purchase storage purchase = userPurchases[user][purchaseId];
        if (!purchase.isActive || purchase.paymentsRemaining == 0) {
            return false;
        }
        return block.timestamp > purchase.nextPaymentDue + GRACE_PERIOD;
    }

    /**
     * @notice Get total amount owed by user across all purchases
     * @param user User address
     */
    function getTotalOwed(address user) external view returns (uint256) {
        uint256 count = userPurchaseCount[user];
        uint256 totalOwed = 0;

        for (uint256 i = 0; i < count; i++) {
            Purchase storage purchase = userPurchases[user][i];
            if (purchase.isActive) {
                uint256 remaining = purchase.amountPerPayment * purchase.paymentsRemaining;
                totalOwed += remaining + purchase.lateFees;
            }
        }

        return totalOwed;
    }
}

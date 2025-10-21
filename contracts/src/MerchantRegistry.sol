// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MerchantRegistry
 * @notice Registry for verified merchants on BitBNPL platform
 * @dev Tracks merchant information, verification status, and transaction statistics
 */
contract MerchantRegistry is Ownable {
    // Platform fee rate in basis points (100 = 1%)
    uint256 public constant PLATFORM_FEE_RATE = 100; // 1%
    uint256 public constant BASIS_POINTS = 10000;

    struct Merchant {
        address walletAddress;      // Where merchant receives MUSD payments
        string businessName;        // Business/store name
        string storeUrl;           // External store URL
        string category;           // Business category
        string logoText;           // Logo initials (e.g., "TH")
        string logoColor;          // Logo background color (e.g., "#3B82F6")
        bool isActive;             // Whether merchant can accept payments
        bool isVerified;           // Verified by platform
        uint256 totalSales;        // Total number of transactions
        uint256 totalVolume;       // Total MUSD volume processed
        uint256 registeredAt;      // Registration timestamp
        uint256 lastTransactionAt; // Last transaction timestamp
    }

    // Merchant wallet address => Merchant data
    mapping(address => Merchant) public merchants;

    // Array of all merchant addresses for enumeration
    address[] public merchantAddresses;

    // Merchant wallet => merchant array index
    mapping(address => uint256) public merchantIndex;

    // Category => merchant addresses
    mapping(string => address[]) public merchantsByCategory;

    // Events
    event MerchantRegistered(
        address indexed walletAddress,
        string businessName,
        string category
    );

    event MerchantUpdated(
        address indexed walletAddress,
        string businessName
    );

    event MerchantVerified(
        address indexed walletAddress
    );

    event MerchantDeactivated(
        address indexed walletAddress
    );

    event MerchantActivated(
        address indexed walletAddress
    );

    event TransactionRecorded(
        address indexed merchantAddress,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Register a new merchant
     * @param walletAddress Merchant's wallet address for receiving payments
     * @param businessName Name of the business
     * @param storeUrl URL of merchant's store
     * @param category Business category
     * @param logoText Logo initials
     * @param logoColor Logo background color
     */
    function registerMerchant(
        address walletAddress,
        string memory businessName,
        string memory storeUrl,
        string memory category,
        string memory logoText,
        string memory logoColor
    ) external {
        require(walletAddress != address(0), "Invalid wallet address");
        require(bytes(businessName).length > 0, "Business name required");
        require(bytes(storeUrl).length > 0, "Store URL required");
        require(!merchants[walletAddress].isActive, "Merchant already registered");

        merchants[walletAddress] = Merchant({
            walletAddress: walletAddress,
            businessName: businessName,
            storeUrl: storeUrl,
            category: category,
            logoText: logoText,
            logoColor: logoColor,
            isActive: true,
            isVerified: false, // Requires platform verification
            totalSales: 0,
            totalVolume: 0,
            registeredAt: block.timestamp,
            lastTransactionAt: 0
        });

        // Add to merchant list
        merchantIndex[walletAddress] = merchantAddresses.length;
        merchantAddresses.push(walletAddress);

        // Add to category list
        merchantsByCategory[category].push(walletAddress);

        emit MerchantRegistered(walletAddress, businessName, category);
    }

    /**
     * @notice Update merchant information
     * @param businessName Updated business name
     * @param storeUrl Updated store URL
     * @param category Updated category
     * @param logoText Updated logo initials
     * @param logoColor Updated logo color
     */
    function updateMerchant(
        string memory businessName,
        string memory storeUrl,
        string memory category,
        string memory logoText,
        string memory logoColor
    ) external {
        Merchant storage merchant = merchants[msg.sender];
        require(merchant.isActive, "Merchant not registered");

        merchant.businessName = businessName;
        merchant.storeUrl = storeUrl;
        merchant.category = category;
        merchant.logoText = logoText;
        merchant.logoColor = logoColor;

        emit MerchantUpdated(msg.sender, businessName);
    }

    /**
     * @notice Verify a merchant (admin only)
     * @param walletAddress Merchant wallet address
     */
    function verifyMerchant(address walletAddress) external onlyOwner {
        Merchant storage merchant = merchants[walletAddress];
        require(merchant.isActive, "Merchant not registered");
        require(!merchant.isVerified, "Already verified");

        merchant.isVerified = true;
        emit MerchantVerified(walletAddress);
    }

    /**
     * @notice Deactivate a merchant (admin only)
     * @param walletAddress Merchant wallet address
     */
    function deactivateMerchant(address walletAddress) external onlyOwner {
        Merchant storage merchant = merchants[walletAddress];
        require(merchant.isActive, "Merchant already inactive");

        merchant.isActive = false;
        emit MerchantDeactivated(walletAddress);
    }

    /**
     * @notice Reactivate a merchant (admin only)
     * @param walletAddress Merchant wallet address
     */
    function activateMerchant(address walletAddress) external onlyOwner {
        Merchant storage merchant = merchants[walletAddress];
        require(!merchant.isActive, "Merchant already active");

        merchant.isActive = true;
        emit MerchantActivated(walletAddress);
    }

    /**
     * @notice Record a transaction for a merchant (called by InstallmentProcessor)
     * @param merchantAddress Merchant wallet address
     * @param amount Transaction amount
     */
    function recordTransaction(address merchantAddress, uint256 amount) external {
        Merchant storage merchant = merchants[merchantAddress];
        require(merchant.isActive, "Merchant not active");

        merchant.totalSales++;
        merchant.totalVolume += amount;
        merchant.lastTransactionAt = block.timestamp;

        emit TransactionRecorded(merchantAddress, amount);
    }

    /**
     * @notice Get merchant details
     * @param walletAddress Merchant wallet address
     */
    function getMerchant(address walletAddress)
        external
        view
        returns (
            string memory businessName,
            string memory storeUrl,
            string memory category,
            string memory logoText,
            string memory logoColor,
            bool isActive,
            bool isVerified,
            uint256 totalSales,
            uint256 totalVolume,
            uint256 registeredAt
        )
    {
        Merchant storage merchant = merchants[walletAddress];
        return (
            merchant.businessName,
            merchant.storeUrl,
            merchant.category,
            merchant.logoText,
            merchant.logoColor,
            merchant.isActive,
            merchant.isVerified,
            merchant.totalSales,
            merchant.totalVolume,
            merchant.registeredAt
        );
    }

    /**
     * @notice Check if merchant is active and can accept payments
     * @param walletAddress Merchant wallet address
     */
    function isActiveMerchant(address walletAddress) external view returns (bool) {
        return merchants[walletAddress].isActive;
    }

    /**
     * @notice Check if merchant is verified
     * @param walletAddress Merchant wallet address
     */
    function isVerifiedMerchant(address walletAddress) external view returns (bool) {
        return merchants[walletAddress].isVerified;
    }

    /**
     * @notice Get total number of registered merchants
     */
    function getTotalMerchants() external view returns (uint256) {
        return merchantAddresses.length;
    }

    /**
     * @notice Get all merchants (paginated)
     * @param offset Starting index
     * @param limit Number of merchants to return
     */
    function getMerchants(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory)
    {
        require(offset < merchantAddresses.length, "Offset out of bounds");

        uint256 end = offset + limit;
        if (end > merchantAddresses.length) {
            end = merchantAddresses.length;
        }

        uint256 resultLength = end - offset;
        address[] memory result = new address[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = merchantAddresses[offset + i];
        }

        return result;
    }

    /**
     * @notice Get merchants by category
     * @param category Category name
     */
    function getMerchantsByCategory(string memory category)
        external
        view
        returns (address[] memory)
    {
        return merchantsByCategory[category];
    }

    /**
     * @notice Calculate platform fee for a transaction
     * @param amount Transaction amount
     */
    function calculatePlatformFee(uint256 amount) external pure returns (uint256) {
        return (amount * PLATFORM_FEE_RATE) / BASIS_POINTS;
    }

    /**
     * @notice Calculate merchant's net amount after platform fee
     * @param amount Transaction amount
     */
    function calculateMerchantAmount(uint256 amount) external pure returns (uint256) {
        uint256 fee = (amount * PLATFORM_FEE_RATE) / BASIS_POINTS;
        return amount - fee;
    }
}

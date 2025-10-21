// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/MerchantRegistry.sol";
import "../src/InstallmentProcessor.sol";
import "forge-std/console.sol";

/**
 * @title DeployBitBNPL
 * @notice Deployment script for BitBNPL platform contracts
 * @dev Run with: forge script script/DeployBitBNPL.s.sol:DeployBitBNPL --broadcast
 */
contract DeployBitBNPL is Script {
    function run() external {
        // Load from environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address musdAddress = vm.envAddress("MUSD_ADDRESS");
        address platformFeeWallet = vm.envAddress("PLATFORM_FEE_WALLET");

        // Get deployer address
        address deployer = vm.addr(deployerPrivateKey);

        console.log("\n=== BitBNPL Deployment ===");
        console.log("Deployer (Admin):", deployer);
        console.log("MUSD Token:", musdAddress);
        console.log("Platform Fee Wallet:", platformFeeWallet);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MerchantRegistry
        console.log("Deploying MerchantRegistry...");
        MerchantRegistry merchantRegistry = new MerchantRegistry();
        console.log("MerchantRegistry deployed at:", address(merchantRegistry));

        // 2. Deploy InstallmentProcessor
        console.log("Deploying InstallmentProcessor...");
        InstallmentProcessor installmentProcessor = new InstallmentProcessor(
            musdAddress,
            address(merchantRegistry),
            platformFeeWallet
        );
        console.log("InstallmentProcessor deployed at:", address(installmentProcessor));

        // 3. Set InstallmentProcessor as authorized caller on MerchantRegistry
        // (needed for recordTransaction function)
        console.log("Configuring contracts...");
        // Note: If needed, add authorization logic here

        vm.stopBroadcast();

        // Print deployment summary
        console.log("");
        console.log("========================================");
        console.log("=== BitBNPL Deployment Summary ===");
        console.log("========================================");
        console.log("");
        console.log("Contract Addresses:");
        console.log("-------------------");
        console.log("MerchantRegistry:");
        console.log(address(merchantRegistry));
        console.log("");
        console.log("InstallmentProcessor:");
        console.log(address(installmentProcessor));
        console.log("");
        console.log("Configuration:");
        console.log("--------------");
        console.log("MUSD Token:");
        console.log(musdAddress);
        console.log("");
        console.log("Platform Fee Wallet:");
        console.log(platformFeeWallet);
        console.log("");
        console.log("Admin/Owner:");
        console.log(deployer);
        console.log("");
        console.log("========================================");
        console.log("Next Steps:");
        console.log("========================================");
        console.log("1. Save contract addresses above");
        console.log("");
        console.log("2. Update frontend/.env.local:");
        console.log("   NEXT_PUBLIC_MERCHANT_REGISTRY_ADDRESS=<MerchantRegistry address>");
        console.log("   NEXT_PUBLIC_INSTALLMENT_PROCESSOR_ADDRESS=<InstallmentProcessor address>");
        console.log("");
        console.log("3. Update frontend/app/admin/page.tsx:");
        console.log("   const ADMIN_ADDRESSES = ['<your deployer address>']");
        console.log("");
        console.log("4. Deposit initial liquidity (50,000 MUSD):");
        console.log("   See DEPLOYMENT.md for commands");
        console.log("");
        console.log("5. Test merchant registration and verification");
        console.log("========================================");
    }
}

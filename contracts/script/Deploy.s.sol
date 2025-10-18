// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/PaymentProcessor.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address mezoVault = vm.envAddress("MEZO_VAULT_ADDRESS");
        address mezoBorrowing = vm.envAddress("MEZO_BORROWING_ADDRESS");
        address musd = vm.envAddress("MUSD_TOKEN_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        PaymentProcessor processor = new PaymentProcessor(mezoVault, mezoBorrowing, musd);

        console.log("PaymentProcessor deployed to:", address(processor));

        vm.stopBroadcast();
    }
}

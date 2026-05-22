// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ProjectFactory}      from "../src/ProjectFactory.sol";
import {DividendDistributor} from "../src/DividendDistributor.sol";
import {ProjectToken}        from "../src/ProjectToken.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev Mock USDC solo para Anvil — no usar en Sepolia.
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}
    function mint(address to, uint256 amount) external { _mint(to, amount); }
    function decimals() public pure override returns (uint8) { return 6; }
}

contract DeployAll is Script {
    function run() external {
        vm.startBroadcast();

        address deployer = msg.sender;

        // 1. Mock USDC (solo Anvil)
        MockUSDC usdc = new MockUSDC();
        usdc.mint(deployer, 1_000_000 * 1e6);
        console.log("MockUSDC:        ", address(usdc));

        // 2. Factory
        ProjectFactory factory = new ProjectFactory(deployer);
        console.log("ProjectFactory:  ", address(factory));

        // 3. Proyecto de ejemplo: Campo Solar Mendoza
        (uint256 id1, address csm) = factory.createProject(
            "Campo Solar Mendoza", "CSM",
            500_000 * 1e18,   // initial supply
            1_000_000 * 1e18, // max supply
            deployer
        );
        console.log("CSM ProjectToken:", csm, "(id:", id1, ")");

        // 4. DividendDistributor para CSM
        DividendDistributor dist = new DividendDistributor(csm, address(usdc), deployer);
        console.log("DividendDist CSM:", address(dist));

        // 5. Conectar distributor al token
        ProjectToken(csm).setDistributor(address(dist));
        console.log("Distributor conectado a CSM");

        // 6. Aprobar USDC al distributor y depositar dividendos de prueba
        usdc.approve(address(dist), type(uint256).max);
        dist.depositDividends(10_000 * 1e6); // 10.000 USDC
        console.log("Dividendos depositados: 10.000 USDC");

        // 7. Segundo proyecto sin distributor (etapa funding)
        (, address eop) = factory.createProject(
            "Eolico Patagonia", "EOP",
            0,
            500_000 * 1e18,
            deployer
        );
        console.log("EOP ProjectToken:", eop, "(funding stage, sin distributor)");

        vm.stopBroadcast();

        console.log("");
        console.log("=== COPIAR A frontend/.env.local ===");
        console.log("NEXT_PUBLIC_USE_ANVIL=true");
        console.log("NEXT_PUBLIC_FACTORY_ADDRESS=", address(factory));
        console.log("NEXT_PUBLIC_USDC_ADDRESS=",    address(usdc));
        console.log("====================================");
    }
}

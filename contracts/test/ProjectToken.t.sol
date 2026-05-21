// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ProjectToken} from "../src/ProjectToken.sol";
import {DividendDistributor} from "../src/DividendDistributor.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDC para el setup del Distribuidor
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract ProjectTokenTest is Test {
    ProjectToken token;
    DividendDistributor distributor;
    MockUSDC usdc;

    address platform = makeAddr("platform");
    address projectOwner = makeAddr("projectOwner");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    uint256 constant INITIAL_SUPPLY = 500_000 * 1e18;
    uint256 constant MAX_SUPPLY = 1_000_000 * 1e18;

    function setUp() public {
        // Desplegamos el token simulando que lo hace la Factory asignando roles
        vm.startPrank(platform);
        token = new ProjectToken("Campo Solar Mendoza", "CSM", INITIAL_SUPPLY, MAX_SUPPLY, projectOwner, platform);

        usdc = new MockUSDC();
        distributor = new DividendDistributor(address(token), address(usdc), platform);

        // Asociamos el distribuidor al token para habilitar los hooks
        token.setDistributor(address(distributor));
        vm.stopPrank();
    }

    // ── 1. Tests de Inicializacion y Roles ───────────────────

    function test_Token_InitialSetupValues() public view {
        assertEq(token.name(), "Campo Solar Mendoza");
        assertEq(token.symbol(), "CSM");
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.maxSupply(), MAX_SUPPLY);
        assertEq(token.balanceOf(projectOwner), INITIAL_SUPPLY);
    }

    function test_Token_RolesAssignedCorrectly() public view {
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), platform));
        assertTrue(token.hasRole(token.MINTER_ROLE(), projectOwner));
    }

    // ── 2. Tests de Emision (Mint) y Limites ─────────────────

    function test_Token_Mint_Success() public {
        uint256 mintAmount = 100_000 * 1e18;

        vm.prank(projectOwner);
        token.mint(alice, mintAmount);

        assertEq(token.balanceOf(alice), mintAmount);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + mintAmount);
    }

    function test_Token_Mint_RevertIf_NotMinter() public {
        vm.prank(alice);
        // Debe revertir por control de accesos de OpenZeppelin
        vm.expectRevert();
        token.mint(alice, 1000 * 1e18);
    }

    function test_Token_Mint_RevertIf_ExceedsMaxSupply() public {
        uint256 excessiveAmount = (MAX_SUPPLY - INITIAL_SUPPLY) + 1;

        vm.prank(projectOwner);
        // Asumiendo que tu token tiene un require o custom error al superar maxSupply
        vm.expectRevert();
        token.mint(alice, excessiveAmount);
    }

    // ── 3. Tests del Circuito de Pausa ───────────────────────

    function test_Token_Pause_Success() public {
        vm.prank(platform);
        token.pause();
        assertTrue(token.paused());

        // Transferencias deben fallar mientras esta pausado
        vm.prank(projectOwner);
        vm.expectRevert();
        token.transfer(alice, 1000 * 1e18);
    }

    function test_Token_Pause_RevertIf_NotAdmin() public {
        vm.prank(alice);
        vm.expectRevert();
        token.pause();
    }

    function test_Token_Unpause_Success() public {
        vm.startPrank(platform);
        token.pause();
        token.unpause();
        vm.stopPrank();

        assertFalse(token.paused());

        // Transferencia vuelve a funcionar despues del unpause
        vm.prank(projectOwner);
        bool success = token.transfer(alice, 1000 * 1e18);
        assertTrue(success);
    }

    // ── 4. Tests de Interaccion con DividendDistributor ──────

    function test_Token_Transfer_TriggersDistributorHook() public {
        // Enviar fondos a Alice y Bob para el escenario
        vm.startPrank(projectOwner);
        token.transfer(alice, 10_000 * 1e18);
        token.transfer(bob, 10_000 * 1e18);
        vm.stopPrank();

        // Fondear y depositar dividendos en USDC para congelar el magnifiedDividendPerShare
        vm.startPrank(platform);
        usdc.mint(platform, 1_000 * 1e6);
        usdc.approve(address(distributor), 1_000 * 1e6);
        distributor.depositDividends(1_000 * 1e6);
        vm.stopPrank();

        // Guardamos el dividendo pendiente inicial de Alice
        uint256 alicePendingBefore = distributor.pendingDividends(alice);
        assertTrue(alicePendingBefore > 0, "Alice should have pending dividends");

        // Alice le transfiere tokens a Bob. Esto ejecuta el hook onTokenTransfer
        vm.prank(alice);
        token.transfer(bob, 5_000 * 1e18);

        // Tras la transferencia, el balance de tokens bajo pero sus dividendos acumulados
        // del corte anterior tienen que mantenerse estables gracias a las correcciones
        uint256 alicePendingAfter = distributor.pendingDividends(alice);
        assertEq(alicePendingAfter, alicePendingBefore, "Pending dividends should fixate during transfer");
    }

    function test_Token_SetDistributor_RevertIf_NotAdmin() public {
        vm.prank(alice);
        vm.expectRevert();
        token.setDistributor(alice);
    }
}

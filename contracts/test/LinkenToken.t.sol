// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// forge-lint: disable(erc20-unchecked-transfer)

import {Test} from "forge-std/Test.sol";
import {LinkenToken} from "../src/LinkenToken.sol";

contract LinkenTokenTest is Test {
    LinkenToken token;

    address platform = makeAddr("platform");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        vm.prank(platform);
        token = new LinkenToken(platform);
    }

    function test_NameAndSymbol() public view {
        assertEq(token.name(), "Linken");
        assertEq(token.symbol(), "LKN");
    }

    function test_InitialSupplyIsZero() public view {
        assertEq(token.totalSupply(), 0);
    }

    function test_AdminCanMint() public {
        vm.prank(platform);
        token.mint(alice, 1000e18);
        assertEq(token.balanceOf(alice), 1000e18);
    }

    function test_NonMinterCannotMint() public {
        vm.prank(alice);
        vm.expectRevert();
        token.mint(alice, 1000e18);
    }

    function test_MintToZeroReverts() public {
        vm.prank(platform);
        vm.expectRevert("LKN: mint to zero");
        token.mint(address(0), 100e18);
    }

    function test_MintZeroAmountReverts() public {
        vm.prank(platform);
        vm.expectRevert("LKN: amount = 0");
        token.mint(alice, 0);
    }

    function test_HolderCanBurn() public {
        vm.prank(platform);
        token.mint(alice, 1000e18);

        vm.prank(alice);
        token.burn(400e18);

        assertEq(token.balanceOf(alice), 600e18);
    }

    function test_BurnZeroReverts() public {
        // Cambiá el string viejo por el que usa tu nuevo LinkenToken.sol
        vm.expectRevert("LKN: amount must be > 0");
        token.burn(0);
    }

    function test_PauseBlocksTransfers() public {
        vm.prank(platform);
        token.mint(alice, 1000e18);

        vm.prank(platform);
        token.pause();

        vm.prank(alice);
        vm.expectRevert();
        token.transfer(bob, 100e18);
    }

    function test_UnpauseRestoresTransfers() public {
        vm.prank(platform);
        token.mint(alice, 1000e18);

        vm.startPrank(platform);
        token.pause();
        token.unpause();
        vm.stopPrank();

        vm.prank(alice);
        token.transfer(bob, 100e18);
        assertEq(token.balanceOf(bob), 100e18);
    }

    function test_NonPauserCannotPause() public {
        vm.prank(alice);
        vm.expectRevert();
        token.pause();
    }

    function testFuzz_MintAnyAmount(uint256 amount) public {
        amount = bound(amount, 1, type(uint128).max);
        vm.prank(platform);
        token.mint(alice, amount);
        assertEq(token.balanceOf(alice), amount);
    }

    function testFuzz_BurnAnyValidAmount(uint256 amount) public {
        uint256 supply = 1_000_000e18;
        amount = bound(amount, 1, supply);

        vm.prank(platform);
        token.mint(alice, supply);

        vm.prank(alice);
        token.burn(amount);

        assertEq(token.balanceOf(alice), supply - amount);
    }
}

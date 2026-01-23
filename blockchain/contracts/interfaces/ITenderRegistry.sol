// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITenderRegistry {
    function isTenderClosed(uint256 tenderId) external view returns (bool);
    function getTenderBidders(uint256 tenderId) external view returns (address[] memory);
}

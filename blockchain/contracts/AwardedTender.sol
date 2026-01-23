// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./TenderAward.sol"; // Reserved for future integration checks

/**
 * @title AwardedTender
 * @dev Token contract representing awarded tender units
 * Integrated with TenderChain AI system
 */
contract AwardedTender is ReentrancyGuard, Ownable, Pausable {

    /* -------------------- */
    /* Constructor          */
    /* -------------------- */

    constructor() Ownable(msg.sender) {
        minter = msg.sender;
    }

    /* -------------------- */
    /* State Variables      */
    /* -------------------- */

    address public minter;

    mapping(address => uint256) public balances;
    mapping(uint256 => uint256) public tenderToTokens;
    mapping(address => uint256[]) public holderToTenders;

    /* -------------------- */
    /* Tender Metadata      */
    /* -------------------- */

    struct TenderToken {
        uint256 tenderId;
        uint256 amount;
        uint256 mintedAt;
        address winner;
    }

    mapping(uint256 => TenderToken) public tenderTokens;
    uint256[] public allAwardedTenders;

    /* -------------------- */
    /* Events               */
    /* -------------------- */

    event Sent(address indexed from, address indexed to, uint256 amount);
    event Minted(address indexed receiver, uint256 amount, uint256 indexed tenderId);
    event Burned(address indexed holder, uint256 amount, uint256 indexed tenderId);
    event BatchMinted(address[] receivers, uint256[] amounts, uint256[] tenderIds);
    event MinterUpdated(address indexed oldMinter, address indexed newMinter);

    /* -------------------- */
    /* Errors               */
    /* -------------------- */

    error InsufficientBalance(uint256 requested, uint256 available);
    error InvalidTender(uint256 tenderId);
    error AlreadyMinted(uint256 tenderId);
    error ZeroAddress();
    error InvalidArrayLength();

    /* -------------------- */
    /* Modifiers            */
    /* -------------------- */

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter");
        _;
    }

    modifier validAddress(address addr) {
        if (addr == address(0)) revert ZeroAddress();
        _;
    }

    /* -------------------- */
    /* Minting              */
    /* -------------------- */

    function mint(
        address receiver,
        uint256 amount,
        uint256 tenderId
    )
        external
        onlyMinter
        validAddress(receiver)
        whenNotPaused
        nonReentrant
    {
        if (tenderToTokens[tenderId] != 0) revert AlreadyMinted(tenderId);
        if (amount == 0) revert InvalidArrayLength();

        balances[receiver] += amount;
        tenderToTokens[tenderId] = amount;

        tenderTokens[tenderId] = TenderToken({
            tenderId: tenderId,
            amount: amount,
            mintedAt: block.timestamp,
            winner: receiver
        });

        allAwardedTenders.push(tenderId);
        holderToTenders[receiver].push(tenderId);

        emit Minted(receiver, amount, tenderId);
    }

    function batchMint(
        address[] memory receivers,
        uint256[] memory amounts,
        uint256[] memory tenderIds
    )
        external
        onlyMinter
        whenNotPaused
        nonReentrant
    {
        if (
            receivers.length != amounts.length ||
            receivers.length != tenderIds.length
        ) revert InvalidArrayLength();

        for (uint256 i = 0; i < receivers.length; i++) {
            if (receivers[i] == address(0)) revert ZeroAddress();
            if (amounts[i] == 0) revert InvalidArrayLength();
            if (tenderToTokens[tenderIds[i]] != 0) revert AlreadyMinted(tenderIds[i]);

            balances[receivers[i]] += amounts[i];
            tenderToTokens[tenderIds[i]] = amounts[i];

            tenderTokens[tenderIds[i]] = TenderToken({
                tenderId: tenderIds[i],
                amount: amounts[i],
                mintedAt: block.timestamp,
                winner: receivers[i]
            });

            allAwardedTenders.push(tenderIds[i]);
            holderToTenders[receivers[i]].push(tenderIds[i]);
        }

        emit BatchMinted(receivers, amounts, tenderIds);
    }

    /* -------------------- */
    /* Transfers            */
    /* -------------------- */

    function send(address receiver, uint256 amount)
        external
        validAddress(receiver)
        whenNotPaused
        nonReentrant
    {
        if (amount > balances[msg.sender]) {
            revert InsufficientBalance(amount, balances[msg.sender]);
        }

        balances[msg.sender] -= amount;
        balances[receiver] += amount;

        emit Sent(msg.sender, receiver, amount);
    }

    /* -------------------- */
    /* Burning              */
    /* -------------------- */

    function burn(uint256 amount, uint256 tenderId)
        external
        whenNotPaused
        nonReentrant
    {
        if (amount > balances[msg.sender]) {
            revert InsufficientBalance(amount, balances[msg.sender]);
        }
        if (tenderToTokens[tenderId] == 0) revert InvalidTender(tenderId);

        balances[msg.sender] -= amount;
        tenderToTokens[tenderId] -= amount;

        if (tenderToTokens[tenderId] == 0) {
            _removeTenderFromHolder(msg.sender, tenderId);
        }

        emit Burned(msg.sender, amount, tenderId);
    }

    /* -------------------- */
    /* Admin                */
    /* -------------------- */

    function updateMinter(address newMinter)
        external
        onlyOwner
        validAddress(newMinter)
    {
        address oldMinter = minter;
        minter = newMinter;
        emit MinterUpdated(oldMinter, newMinter);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /* -------------------- */
    /* Views                */
    /* -------------------- */

    function getTenderToken(uint256 tenderId)
        external
        view
        returns (TenderToken memory)
    {
        if (tenderToTokens[tenderId] == 0) revert InvalidTender(tenderId);
        return tenderTokens[tenderId];
    }

    function getHolderTenders(address holder)
        external
        view
        returns (uint256[] memory)
    {
        return holderToTenders[holder];
    }

    function getAllAwardedTenders()
        external
        view
        returns (uint256[] memory)
    {
        return allAwardedTenders;
    }

    function totalSupply() external view returns (uint256 supply) {
        for (uint256 i = 0; i < allAwardedTenders.length; i++) {
            supply += tenderToTokens[allAwardedTenders[i]];
        }
    }

    /* -------------------- */
    /* Internal             */
    /* -------------------- */

    function _removeTenderFromHolder(address holder, uint256 tenderId) internal {
        uint256[] storage tenders = holderToTenders[holder];
        for (uint256 i = 0; i < tenders.length; i++) {
            if (tenders[i] == tenderId) {
                tenders[i] = tenders[tenders.length - 1];
                tenders.pop();
                break;
            }
        }
    }
}

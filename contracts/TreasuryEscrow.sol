// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TenderAward.sol";

contract TreasuryEscrow is ReentrancyGuard, Ownable {

    constructor(
        address _tenderAwardAddress,
        address _paymentTokenAddress
    ) Ownable(msg.sender) {
        tenderAward = TenderAward(_tenderAwardAddress);
        paymentToken = IERC20(_paymentTokenAddress);
    }

    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        bool paid;
        uint256 completionTime;
    }

    struct EscrowContract {
        uint256 tenderId;
        address winner;
        uint256 totalAmount;
        uint256 amountReleased;
        bool isActive;
        Milestone[] milestones;
    }

    TenderAward public tenderAward;
    IERC20 public paymentToken;

    mapping(uint256 => EscrowContract) private escrows;
    mapping(uint256 => bool) public escrowExists;

    event FundsLocked(uint256 indexed tenderId, address indexed winner, uint256 amount);
    event MilestoneCompleted(uint256 indexed tenderId, uint256 milestoneIndex);
    event FundsReleased(uint256 indexed tenderId, address indexed recipient, uint256 amount);
    event EscrowClosed(uint256 indexed tenderId);

    function createEscrow(
        uint256 _tenderId,
        address _winner,
        uint256 _totalAmount,
        string[] calldata _milestoneDescriptions,
        uint256[] calldata _milestoneAmounts
    ) external onlyOwner {
        require(!escrowExists[_tenderId], "Escrow already exists");
        require(_milestoneDescriptions.length == _milestoneAmounts.length, "Array length mismatch");

        uint256 totalMilestoneAmount;

        EscrowContract storage escrow = escrows[_tenderId];
        escrow.tenderId = _tenderId;
        escrow.winner = _winner;
        escrow.totalAmount = _totalAmount;
        escrow.amountReleased = 0;
        escrow.isActive = true;

        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            escrow.milestones.push(
                Milestone({
                    description: _milestoneDescriptions[i],
                    amount: _milestoneAmounts[i],
                    completed: false,
                    paid: false,
                    completionTime: 0
                })
            );

            totalMilestoneAmount += _milestoneAmounts[i];
        }

        require(totalMilestoneAmount == _totalAmount, "Milestones must equal total");

        escrowExists[_tenderId] = true;

        require(
            paymentToken.transferFrom(msg.sender, address(this), _totalAmount),
            "Token transfer failed"
        );

        emit FundsLocked(_tenderId, _winner, _totalAmount);
    }

    function completeMilestone(uint256 _tenderId, uint256 _milestoneIndex)
        external
        onlyOwner
    {
        require(escrowExists[_tenderId], "Escrow not found");

        EscrowContract storage escrow = escrows[_tenderId];
        require(escrow.isActive, "Escrow inactive");
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone");

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        require(!milestone.completed, "Already completed");

        milestone.completed = true;
        milestone.completionTime = block.timestamp;

        emit MilestoneCompleted(_tenderId, _milestoneIndex);
    }

    function releaseMilestonePayment(uint256 _tenderId, uint256 _milestoneIndex)
        external
        nonReentrant
        onlyOwner
    {
        require(escrowExists[_tenderId], "Escrow not found");

        EscrowContract storage escrow = escrows[_tenderId];
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone");

        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        require(milestone.completed, "Not completed");
        require(!milestone.paid, "Already paid");

        milestone.paid = true;
        escrow.amountReleased += milestone.amount;

        require(
            paymentToken.transfer(escrow.winner, milestone.amount),
            "Payment failed"
        );

        emit FundsReleased(_tenderId, escrow.winner, milestone.amount);
    }

    function closeEscrow(uint256 _tenderId) external onlyOwner {
        require(escrowExists[_tenderId], "Escrow not found");

        EscrowContract storage escrow = escrows[_tenderId];
        require(
            escrow.amountReleased == escrow.totalAmount,
            "Funds still locked"
        );

        escrow.isActive = false;
        emit EscrowClosed(_tenderId);
    }

    function getEscrow(uint256 _tenderId)
        external
        view
        returns (EscrowContract memory)
    {
        require(escrowExists[_tenderId], "Escrow not found");
        return escrows[_tenderId];
    }
}
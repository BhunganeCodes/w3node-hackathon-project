// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface ITenderRegistry {
    function tenders(uint256) external view returns (
        uint256 id,
        address treasury,
        string memory title,
        string memory description,
        string memory ipfsHash,
        uint256 budget,
        uint256 deadline,
        uint8 status,
        uint256 createdAt
    );
    
    function bids(uint256) external view returns (
        uint256 id,
        uint256 tenderId,
        address bidder,
        string memory ipfsHash,
        uint256 amount,
        uint256 submittedAt,
        uint8 status,
        uint256 aiScore,
        bool aiScoreSet
    );
}

contract TreasuryEscrow is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    
    ITenderRegistry public tenderRegistry;
    
    enum MilestoneStatus { Pending, Submitted, Approved, Rejected, Paid }
    
    struct Escrow {
        uint256 tenderId;
        uint256 bidId;
        address contractor;
        uint256 totalAmount;
        uint256 releasedAmount;
        bool isActive;
        uint256 createdAt;
    }
    
    struct Milestone {
        uint256 escrowId;
        string description;
        uint256 amount;
        uint256 deadline;
        MilestoneStatus status;
        string evidenceIpfsHash;
        uint256 submittedAt;
        uint256 approvedAt;
    }
    
    uint256 private _escrowCounter;
    uint256 private _milestoneCounter;
    
    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => uint256) public tenderToEscrow;
    mapping(uint256 => Milestone) public milestones;
    mapping(uint256 => uint256[]) public escrowMilestones;
    
    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed tenderId,
        address indexed contractor,
        uint256 amount
    );
    
    event MilestoneCreated(
        uint256 indexed milestoneId,
        uint256 indexed escrowId,
        string description,
        uint256 amount
    );
    
    event MilestoneSubmitted(
        uint256 indexed milestoneId,
        string evidenceHash
    );
    
    event MilestoneApproved(
        uint256 indexed milestoneId,
        uint256 amount
    );
    
    event MilestoneRejected(
        uint256 indexed milestoneId,
        string reason
    );
    
    event PaymentReleased(
        uint256 indexed escrowId,
        uint256 indexed milestoneId,
        address indexed contractor,
        uint256 amount
    );
    
    constructor(address _tenderRegistry) {
        require(_tenderRegistry != address(0), "Invalid registry address");
        tenderRegistry = ITenderRegistry(_tenderRegistry);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, msg.sender);
    }
    
    modifier onlyTreasury() {
        require(hasRole(TREASURY_ROLE, msg.sender), "Caller is not treasury");
        _;
    }
    
    function createEscrow(
        uint256 _tenderId,
        uint256 _bidId
    ) external payable onlyTreasury whenNotPaused returns (uint256) {
        require(tenderToEscrow[_tenderId] == 0, "Escrow already exists");
        
        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            uint8 tenderStatus,
        ) = tenderRegistry.tenders(_tenderId);
        require(tenderStatus == 2, "Tender not awarded");
        
        (
            ,
            ,
            address bidder,
            ,
            uint256 bidAmount,
            ,
            ,
            ,
        ) = tenderRegistry.bids(_bidId);
        
        require(msg.value == bidAmount, "Incorrect escrow amount");
        
        _escrowCounter++;
        uint256 escrowId = _escrowCounter;
        
        escrows[escrowId] = Escrow({
            tenderId: _tenderId,
            bidId: _bidId,
            contractor: bidder,
            totalAmount: bidAmount,
            releasedAmount: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        tenderToEscrow[_tenderId] = escrowId;
        
        emit EscrowCreated(escrowId, _tenderId, bidder, bidAmount);
        return escrowId;
    }
    
    function createMilestone(
        uint256 _escrowId,
        string memory _description,
        uint256 _amount,
        uint256 _deadline
    ) external onlyTreasury whenNotPaused returns (uint256) {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.isActive, "Escrow not active");
        require(_deadline > block.timestamp, "Invalid deadline");
        
        uint256 totalMilestones = 0;
        uint256[] memory milestoneIds = escrowMilestones[_escrowId];
        for (uint256 i = 0; i < milestoneIds.length; i++) {
            totalMilestones += milestones[milestoneIds[i]].amount;
        }
        
        require(totalMilestones + _amount <= escrow.totalAmount, "Exceeds total amount");
        
        _milestoneCounter++;
        uint256 milestoneId = _milestoneCounter;
        
        milestones[milestoneId] = Milestone({
            escrowId: _escrowId,
            description: _description,
            amount: _amount,
            deadline: _deadline,
            status: MilestoneStatus.Pending,
            evidenceIpfsHash: "",
            submittedAt: 0,
            approvedAt: 0
        });
        
        escrowMilestones[_escrowId].push(milestoneId);
        
        emit MilestoneCreated(milestoneId, _escrowId, _description, _amount);
        return milestoneId;
    }
    
    function submitMilestone(
        uint256 _milestoneId,
        string memory _evidenceIpfsHash
    ) external whenNotPaused {
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.escrowId != 0, "Milestone does not exist");
        
        Escrow storage escrow = escrows[milestone.escrowId];
        require(msg.sender == escrow.contractor, "Not the contractor");
        require(milestone.status == MilestoneStatus.Pending, "Invalid status");
        require(block.timestamp <= milestone.deadline, "Deadline passed");
        
        milestone.status = MilestoneStatus.Submitted;
        milestone.evidenceIpfsHash = _evidenceIpfsHash;
        milestone.submittedAt = block.timestamp;
        
        emit MilestoneSubmitted(_milestoneId, _evidenceIpfsHash);
    }
    
    function approveMilestone(uint256 _milestoneId) 
        external 
        onlyTreasury 
        nonReentrant 
        whenNotPaused 
    {
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.escrowId != 0, "Milestone does not exist");
        require(milestone.status == MilestoneStatus.Submitted, "Not submitted");
        
        Escrow storage escrow = escrows[milestone.escrowId];
        require(escrow.isActive, "Escrow not active");
        
        milestone.status = MilestoneStatus.Approved;
        milestone.approvedAt = block.timestamp;
        
        emit MilestoneApproved(_milestoneId, milestone.amount);
        
        _releaseFunds(milestone.escrowId, _milestoneId);
    }
    
    function rejectMilestone(
        uint256 _milestoneId,
        string memory _reason
    ) external onlyTreasury whenNotPaused {
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.escrowId != 0, "Milestone does not exist");
        require(milestone.status == MilestoneStatus.Submitted, "Not submitted");
        
        milestone.status = MilestoneStatus.Rejected;
        
        emit MilestoneRejected(_milestoneId, _reason);
    }
    
    function _releaseFunds(uint256 _escrowId, uint256 _milestoneId) private {
        Escrow storage escrow = escrows[_escrowId];
        Milestone storage milestone = milestones[_milestoneId];
        
        require(
            escrow.releasedAmount + milestone.amount <= escrow.totalAmount,
            "Insufficient escrow balance"
        );
        
        escrow.releasedAmount += milestone.amount;
        milestone.status = MilestoneStatus.Paid;
        
        (bool success, ) = escrow.contractor.call{value: milestone.amount}("");
        require(success, "Payment transfer failed");
        
        emit PaymentReleased(_escrowId, _milestoneId, escrow.contractor, milestone.amount);
    }
    
    function getEscrowMilestones(uint256 _escrowId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return escrowMilestones[_escrowId];
    }
    
    function getEscrowBalance(uint256 _escrowId) 
        external 
        view 
        returns (uint256) 
    {
        Escrow storage escrow = escrows[_escrowId];
        return escrow.totalAmount - escrow.releasedAmount;
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    receive() external payable {}
}
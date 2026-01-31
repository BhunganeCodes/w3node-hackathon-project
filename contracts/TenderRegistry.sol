// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract TenderRegistry is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant AI_ORACLE_ROLE = keccak256("AI_ORACLE_ROLE");
    
    enum TenderStatus { Open, UnderReview, Awarded, Cancelled, Completed }
    enum BidStatus { Submitted, UnderReview, Accepted, Rejected }
    
    struct Tender {
        uint256 id;
        address treasury;
        string title;
        string description;
        string ipfsHash;
        uint256 budget;
        uint256 deadline;
        TenderStatus status;
        uint256 createdAt;
        string[] evaluationCriteria;
        uint256[] criteriaWeights;
    }
    
    struct Bid {
        uint256 id;
        uint256 tenderId;
        address bidder;
        string ipfsHash;
        uint256 amount;
        uint256 submittedAt;
        BidStatus status;
        uint256 aiScore;
        bool aiScoreSet;
    }
    
    uint256 private _tenderCounter;
    uint256 private _bidCounter;
    
    mapping(uint256 => Tender) public tenders;
    mapping(uint256 => Bid) public bids;
    mapping(uint256 => uint256[]) public tenderBids;
    mapping(address => uint256[]) public bidderBids;
    mapping(uint256 => uint256) public awardedBids;
    
    event TenderCreated(
        uint256 indexed tenderId,
        address indexed treasury,
        string title,
        uint256 budget,
        uint256 deadline
    );
    
    event BidSubmitted(
        uint256 indexed bidId,
        uint256 indexed tenderId,
        address indexed bidder,
        uint256 amount
    );
    
    event AIScoreSubmitted(
        uint256 indexed bidId,
        uint256 score
    );
    
    event TenderAwarded(
        uint256 indexed tenderId,
        uint256 indexed bidId,
        address indexed winner,
        uint256 amount
    );
    
    event TenderCancelled(uint256 indexed tenderId);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, msg.sender);
    }
    
    modifier onlyTreasury() {
        require(hasRole(TREASURY_ROLE, msg.sender), "Caller is not treasury");
        _;
    }
    
    modifier onlyAIOracle() {
        require(hasRole(AI_ORACLE_ROLE, msg.sender), "Caller is not AI oracle");
        _;
    }
    
    function createTender(
        string memory _title,
        string memory _description,
        string memory _ipfsHash,
        uint256 _budget,
        uint256 _deadline,
        string[] memory _criteria,
        uint256[] memory _weights
    ) external onlyTreasury whenNotPaused returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(_budget > 0, "Budget must be greater than 0");
        require(_criteria.length == _weights.length, "Criteria and weights mismatch");
        
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < _weights.length; i++) {
            totalWeight += _weights[i];
        }
        require(totalWeight == 100, "Weights must sum to 100");
        
        _tenderCounter++;
        uint256 tenderId = _tenderCounter;
        
        tenders[tenderId] = Tender({
            id: tenderId,
            treasury: msg.sender,
            title: _title,
            description: _description,
            ipfsHash: _ipfsHash,
            budget: _budget,
            deadline: _deadline,
            status: TenderStatus.Open,
            createdAt: block.timestamp,
            evaluationCriteria: _criteria,
            criteriaWeights: _weights
        });
        
        emit TenderCreated(tenderId, msg.sender, _title, _budget, _deadline);
        return tenderId;
    }
    
    function submitBid(
        uint256 _tenderId,
        string memory _ipfsHash,
        uint256 _amount
    ) external whenNotPaused returns (uint256) {
        Tender storage tender = tenders[_tenderId];
        require(tender.id != 0, "Tender does not exist");
        require(tender.status == TenderStatus.Open, "Tender not open");
        require(block.timestamp <= tender.deadline, "Tender deadline passed");
        require(_amount <= tender.budget, "Bid exceeds budget");
        require(_amount > 0, "Bid amount must be greater than 0");
        
        _bidCounter++;
        uint256 bidId = _bidCounter;
        
        bids[bidId] = Bid({
            id: bidId,
            tenderId: _tenderId,
            bidder: msg.sender,
            ipfsHash: _ipfsHash,
            amount: _amount,
            submittedAt: block.timestamp,
            status: BidStatus.Submitted,
            aiScore: 0,
            aiScoreSet: false
        });
        
        tenderBids[_tenderId].push(bidId);
        bidderBids[msg.sender].push(bidId);
        
        emit BidSubmitted(bidId, _tenderId, msg.sender, _amount);
        return bidId;
    }
    
    function submitAIScore(uint256 _bidId, uint256 _score) 
        external 
        onlyAIOracle 
        whenNotPaused 
    {
        Bid storage bid = bids[_bidId];
        require(bid.id != 0, "Bid does not exist");
        require(!bid.aiScoreSet, "AI score already set");
        require(_score <= 100, "Score must be 0-100");
        
        Tender storage tender = tenders[bid.tenderId];
        require(tender.status == TenderStatus.Open || tender.status == TenderStatus.UnderReview, 
                "Invalid tender status");
        
        bid.aiScore = _score;
        bid.aiScoreSet = true;
        bid.status = BidStatus.UnderReview;
        
        emit AIScoreSubmitted(_bidId, _score);
    }
    
    function awardTender(uint256 _tenderId, uint256 _bidId) 
        external 
        onlyTreasury 
        whenNotPaused 
    {
        Tender storage tender = tenders[_tenderId];
        require(tender.id != 0, "Tender does not exist");
        require(tender.treasury == msg.sender, "Not tender owner");
        require(tender.status == TenderStatus.Open || tender.status == TenderStatus.UnderReview, 
                "Cannot award tender");
        
        Bid storage bid = bids[_bidId];
        require(bid.id != 0, "Bid does not exist");
        require(bid.tenderId == _tenderId, "Bid not for this tender");
        require(bid.aiScoreSet, "AI score not set");
        
        tender.status = TenderStatus.Awarded;
        bid.status = BidStatus.Accepted;
        awardedBids[_tenderId] = _bidId;
        
        emit TenderAwarded(_tenderId, _bidId, bid.bidder, bid.amount);
    }
    
    function cancelTender(uint256 _tenderId) external onlyTreasury {
        Tender storage tender = tenders[_tenderId];
        require(tender.id != 0, "Tender does not exist");
        require(tender.treasury == msg.sender, "Not tender owner");
        require(tender.status == TenderStatus.Open, "Cannot cancel tender");
        
        tender.status = TenderStatus.Cancelled;
        emit TenderCancelled(_tenderId);
    }
    
    function getTenderBids(uint256 _tenderId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return tenderBids[_tenderId];
    }
    
    function getBidderBids(address _bidder) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return bidderBids[_bidder];
    }
    
    function getWinningBid(uint256 _tenderId) 
        external 
        view 
        returns (uint256) 
    {
        require(tenders[_tenderId].status == TenderStatus.Awarded, "Tender not awarded");
        return awardedBids[_tenderId];
    }
    
    function setTenderUnderReview(uint256 _tenderId) 
        external 
        onlyTreasury 
    {
        Tender storage tender = tenders[_tenderId];
        require(tender.id != 0, "Tender does not exist");
        require(tender.status == TenderStatus.Open, "Tender not open");
        tender.status = TenderStatus.UnderReview;
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
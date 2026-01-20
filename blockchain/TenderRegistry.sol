// SPDX-License-Identifier: GPL-3.0  
pragma solidity ^0.8.26;  
  
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";  
import "@openzeppelin/contracts/access/Ownable.sol";  
  
contract TenderRegistry is ReentrancyGuard, Ownable {  
    struct Tender {  
        string title;  
        string description;  
        uint256 deadline;  
        string ipfsHash;  
        address treasury;  
        bool isActive;  
        uint256 totalBids;  
    }  
      
    struct Bid {  
        address bidder;  
        string ipfsHash;  
        uint256 timestamp;  
        bool isValid;  
    }  
      
    mapping(uint256 => Tender) public tenders;  
    mapping(uint256 => mapping(address => Bid)) public bids;  
    mapping(uint256 => address[]) public bidders;  
      
    uint256 public tenderCounter;  
      
    event TenderCreated(uint256 indexed tenderId, address indexed treasury, string title, uint256 deadline);  
    event BidSubmitted(uint256 indexed tenderId, address indexed bidder, string ipfsHash);  
    event TenderClosed(uint256 indexed tenderId);  
      
    modifier onlyTreasury(uint256 _tenderId) {  
        require(msg.sender == tenders[_tenderId].treasury, "Only treasury can perform this action");  
        _;  
    }  
      
    modifier tenderActive(uint256 _tenderId) {  
        require(tenders[_tenderId].isActive, "Tender is not active");  
        require(block.timestamp < tenders[_tenderId].deadline, "Tender deadline has passed");  
        _;  
    }  
      
    function createTender(  
        string memory _title,  
        string memory _description,  
        uint256 _deadline,  
        string memory _ipfsHash  
    ) external onlyOwner returns (uint256) {  
        require(_deadline > block.timestamp, "Deadline must be in the future");  
          
        tenderCounter++;  
        tenders[tenderCounter] = Tender({  
            title: _title,  
            description: _description,  
            deadline: _deadline,  
            ipfsHash: _ipfsHash,  
            treasury: msg.sender,  
            isActive: true,  
            totalBids: 0  
        });  
          
        emit TenderCreated(tenderCounter, msg.sender, _title, _deadline);  
        return tenderCounter;  
    }  
      
    function submitBid(uint256 _tenderId, string memory _ipfsHash) external nonReentrant tenderActive(_tenderId) {  
        require(bids[_tenderId][msg.sender].timestamp == 0, "Bid already submitted");  
          
        bids[_tenderId][msg.sender] = Bid({  
            bidder: msg.sender,  
            ipfsHash: _ipfsHash,  
            timestamp: block.timestamp,  
            isValid: true  
        });  
          
        bidders[_tenderId].push(msg.sender);  
        tenders[_tenderId].totalBids++;  
          
        emit BidSubmitted(_tenderId, msg.sender, _ipfsHash);  
    }  
      
    function closeTender(uint256 _tenderId) external onlyTreasury(_tenderId) {  
        tenders[_tenderId].isActive = false;  
        emit TenderClosed(_tenderId);  
    }  
      
    function getBidders(uint256 _tenderId) external view returns (address[] memory) {  
        return bidders[_tenderId];  
    }  
      
    function getTender(uint256 _tenderId) external view returns (Tender memory) {  
        return tenders[_tenderId];  
    }  
}
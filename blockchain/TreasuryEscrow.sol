// SPDX-License-Identifier: GPL-3.0  
pragma solidity ^0.8.26;  
  
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";  
import "@openzeppelin/contracts/access/Ownable.sol";  
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";  
import "./TenderAward.sol";  
  
contract TreasuryEscrow is ReentrancyGuard, Ownable {  
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
      
    mapping(uint256 => EscrowContract) public escrows;  
    mapping(uint256 => bool) public escrowExists;  
      
    event FundsLocked(uint256 indexed tenderId, address indexed winner, uint256 amount);  
    event MilestoneCompleted(uint256 indexed tenderId, uint256 milestoneIndex);  
    event FundsReleased(uint256 indexed tenderId, address indexed recipient, uint256 amount);  
    event EscrowClosed(uint256 indexed tenderId);  
      
    constructor(address _tenderAwardAddress, address _paymentTokenAddress) {  
        tenderAward = TenderAward(_tenderAwardAddress);  
        paymentToken = IERC20(_paymentTokenAddress);  
    }  
      
    function createEscrow(  
        uint256 _tenderId,  
        address _winner,  
        uint256 _totalAmount,  
        string[] memory _milestoneDescriptions,  
        uint256[] memory _milestoneAmounts  
    ) external onlyOwner {  
        require(!escrowExists[_tenderId], "Escrow already exists for this tender");  
        require(_milestoneDescriptions.length == _milestoneAmounts.length, "Milestone arrays must match");  
          
        uint256 totalMilestoneAmount = 0;  
        Milestone[] memory milestones = new Milestone[](_milestoneDescriptions.length);  
          
        for (uint i = 0; i < _milestoneDescriptions.length; i++) {  
            milestones[i] = Milestone({  
                description: _milestoneDescriptions[i],  
                amount: _milestoneAmounts[i],  
                completed: false,  
                paid: false,  
                completionTime: 0  
            });  
            totalMilestoneAmount += _milestoneAmounts[i];  
        }  
          
        require(totalMilestoneAmount == _totalAmount, "Milestone amounts must equal total amount");  
          
        escrows[_tenderId] = EscrowContract({  
            tenderId: _tenderId,  
            winner: _winner,  
            totalAmount: _totalAmount,  
            amountReleased: 0,  
            isActive: true,  
            milestones: milestones  
        });  
          
        escrowExists[_tenderId] = true;  
          
        require(paymentToken.transferFrom(msg.sender, address(this), _totalAmount), "Token transfer failed");  
          
        emit FundsLocked(_tenderId, _winner, _totalAmount);  
    }  
      
    function completeMilestone(uint256 _tenderId, uint256 _milestoneIndex) external onlyOwner {  
        require(escrowExists[_tenderId], "Escrow does not exist");  
        require(escrows[_tenderId].isActive, "Escrow is not active");  
        require(_milestoneIndex < escrows[_tenderId].milestones.length, "Invalid milestone index");  
        require(!escrows[_tenderId].milestones[_milestoneIndex].completed, "Milestone already completed");  
          
        escrows[_tenderId].milestones[_milestoneIndex].completed = true;  
        escrows[_tenderId].milestones[_milestoneIndex].completionTime = block.timestamp;  
          
        emit MilestoneCompleted(_tenderId, _milestoneIndex);  
    }  
      
    function releaseMilestonePayment(uint256 _tenderId, uint256 _milestoneIndex) external nonReentrant onlyOwner {  
        require(escrowExists[_tenderId], "Escrow does not exist");  
        require(_milestoneIndex < escrows[_tenderId].milestones.length, "Invalid milestone index");  
          
        Milestone storage milestone = escrows[_tenderId].milestones[_milestoneIndex];  
        require(milestone.completed && !milestone.paid, "Milestone not completed or already paid");  
          
        milestone.paid = true;  
        escrows[_tenderId].amountReleased += milestone.amount;  
          
        require(paymentToken.transfer(escrows[_tenderId].winner, milestone.amount), "Token transfer failed");  
          
        emit FundsReleased(_tenderId, escrows[_tenderId].winner, milestone.amount);  
    }  
      
    function closeEscrow(uint256 _tenderId) external onlyOwner {  
        require(escrowExists[_tenderId], "Escrow does not exist");  
        require(escrows[_tenderId].amountReleased == escrows[_tenderId].totalAmount, "All funds must be released");  
          
        escrows[_tenderId].isActive = false;  
        emit EscrowClosed(_tenderId);  
    }  
      
    function getEscrow(uint256 _tenderId) external view returns (EscrowContract memory) {  
        require(escrowExists[_tenderId], "Escrow does not exist");  
        return escrows[_tenderId];  
    }  
}
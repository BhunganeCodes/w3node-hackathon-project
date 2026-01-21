// SPDX-License-Identifier: GPL-3.0  
pragma solidity ^0.8.26;  
  
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";  
import "@openzeppelin/contracts/access/Ownable.sol";  
import "@openzeppelin/contracts/security/Pausable.sol";  
import "./TenderAward.sol";  
  
/**  
 * @title AwardedTender  
 * @dev Token contract representing awarded tender units  
 * Enhanced version with integration to TenderChain AI system  
 */  
contract AwardedTender is ReentrancyGuard, Ownable, Pausable {  
    // State variables  
    address public minter;  
    mapping(address => uint) public balances;  
    mapping(uint256 => uint) public tenderToTokens; // Maps tender ID to token amount  
    mapping(address => uint256[]) public holderToTenders; // Tracks which tenders a holder has tokens for  
      
    // Tender metadata  
    struct TenderToken {  
        uint256 tenderId;  
        uint256 amount;  
        uint256 mintedAt;  
        address winner;  
    }  
      
    mapping(uint256 => TenderToken) public tenderTokens;  
    uint256[] public allAwardedTenders;  
      
    // Events  
    event Sent(address from, address to, uint amount);  
    event Minted(address indexed receiver, uint amount, uint256 indexed tenderId);  
    event Burned(address indexed holder, uint amount, uint256 indexed tenderId);  
    event BatchMinted(address[] receivers, uint[] amounts, uint256[] tenderIds);  
    event MinterUpdated(address oldMinter, address newMinter);  
      
    // Errors  
    error InsufficientBalance(uint requested, uint available);  
    error InvalidTender(uint256 tenderId);  
    error AlreadyMinted(uint256 tenderId);  
    error ZeroAddress();  
    error InvalidArrayLength();  
      
    // Modifiers  
    modifier onlyMinter() {  
        require(msg.sender == minter, "Only minter can perform this action");  
        _;  
    }  
      
    modifier validAddress(address _address) {  
        if (_address == address(0)) revert ZeroAddress();  
        _;  
    }  
      
    constructor() {  
        minter = msg.sender;  
    }  
      
    /**  
     * @dev Mint new tokens for a tender award  
     * @param receiver Address to receive tokens  
     * @param amount Amount of tokens to mint  
     * @param tenderId ID of the awarded tender  
     */  
    function mint(address receiver, uint amount, uint256 tenderId)   
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
          
        // Store tender metadata  
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
      
    /**  
     * @dev Batch mint tokens for multiple tenders  
     */  
    function batchMint(  
        address[] memory receivers,  
        uint[] memory amounts,  
        uint256[] memory tenderIds  
    ) external onlyMinter whenNotPaused nonReentrant {  
        if (receivers.length != amounts.length || receivers.length != tenderIds.length) {  
            revert InvalidArrayLength();  
        }  
          
        for (uint i = 0; i < receivers.length; i++) {  
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
      
    /**  
     * @dev Send tokens to another address  
     */  
    function send(address receiver, uint amount)   
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
      
    /**  
     * @dev Burn tokens (for completed tenders)  
     */  
    function burn(uint amount, uint256 tenderId) external whenNotPaused nonReentrant {  
        if (amount > balances[msg.sender]) {  
            revert InsufficientBalance(amount, balances[msg.sender]);  
        }  
        if (tenderToTokens[tenderId] == 0) revert InvalidTender(tenderId);  
          
        balances[msg.sender] -= amount;  
        tenderToTokens[tenderId] -= amount;  
          
        // Remove from holder's tender list if fully burned  
        if (tenderToTokens[tenderId] == 0) {  
            _removeTenderFromHolder(msg.sender, tenderId);  
        }  
          
        emit Burned(msg.sender, amount, tenderId);  
    }  
      
    /**  
     * @dev Update minter address  
     */  
    function updateMinter(address newMinter) external onlyOwner validAddress(newMinter) {  
        address oldMinter = minter;  
        minter = newMinter;  
        emit MinterUpdated(oldMinter, newMinter);  
    }  
      
    /**  
     * @dev Get tender info for a specific tender ID  
     */  
    function getTenderToken(uint256 tenderId) external view returns (TenderToken memory) {  
        if (tenderToTokens[tenderId] == 0) revert InvalidTender(tenderId);  
        return tenderTokens[tenderId];  
    }  
      
    /**  
     * @dev Get all tenders held by an address  
     */  
    function getHolderTenders(address holder) external view returns (uint256[] memory) {  
        return holderToTenders[holder];  
    }  
      
    /**  
     * @dev Get all awarded tender IDs  
     */  
    function getAllAwardedTenders() external view returns (uint256[] memory) {  
        return allAwardedTenders;  
    }  
      
    /**  
     * @dev Get total supply  
     */  
    function totalSupply() external view returns (uint) {  
        uint supply = 0;  
        for (uint i = 0; i < allAwardedTenders.length; i++) {  
            supply += tenderToTokens[allAwardedTenders[i]];  
        }  
        return supply;  
    }  
      
    /**  
     * @dev Emergency pause function  
     */  
    function pause() external onlyOwner {  
        _pause();  
    }  
      
    /**  
     * @dev Unpause function  
     */  
    function unpause() external onlyOwner {  
        _unpause();  
    }  
      
    /**  
     * @dev Internal function to remove tender from holder's list  
     */  
    function _removeTenderFromHolder(address holder, uint256 tenderId) internal {  
        uint256[] storage tenders = holderToTenders[holder];  
        for (uint i = 0; i < tenders.length; i++) {  
            if (tenders[i] == tenderId) {  
                tenders[i] = tenders[tenders.length - 1];  
                tenders.pop();  
                break;  
            }  
        }  
    }  
}
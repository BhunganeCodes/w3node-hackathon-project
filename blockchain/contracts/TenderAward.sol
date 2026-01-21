// SPDX-License-Identifier: GPL-3.0  
pragma solidity ^0.8.26;  
  
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";  
import "@openzeppelin/contracts/access/Ownable.sol";  
import "./TenderRegistry.sol";  
  
contract TenderAward is ReentrancyGuard, Ownable {  
    struct EvaluationScore {  
        address bidder;  
        uint256 complianceScore;  
        uint256 qualityScore;  
        uint256 totalScore;  
        bool isValid;  
    }  
      
    struct AwardResult {  
        uint256 tenderId;  
        address winner;  
        uint256 winningScore;  
        bool finalized;  
    }  
      
    TenderRegistry public tenderRegistry;  
      
    mapping(uint256 => mapping(address => EvaluationScore)) public scores;  
    mapping(uint256 => AwardResult) public awards;  
    mapping(uint256 => bool) public evaluationComplete;  
      
    address public oracleAddress;  
      
    event ScoresSubmitted(uint256 indexed tenderId, address indexed oracle);  
    event WinnerSelected(uint256 indexed tenderId, address indexed winner, uint256 score);  
    event AwardFinalized(uint256 indexed tenderId);  
      
    modifier onlyOracle() {  
        require(msg.sender == oracleAddress, "Only authorized oracle can submit scores");  
        _;  
    }  
      
    modifier evaluationNotComplete(uint256 _tenderId) {  
        require(!evaluationComplete[_tenderId], "Evaluation already completed");  
        _;  
    }  
      
    constructor(address _tenderRegistryAddress, address _oracleAddress) {  
        tenderRegistry = TenderRegistry(_tenderRegistryAddress);  
        oracleAddress = _oracleAddress;  
    }  
      
    function submitAIScores(  
        uint256 _tenderId,  
        address[] memory _bidders,  
        uint256[] memory _complianceScores,  
        uint256[] memory _qualityScores  
    ) external onlyOracle evaluationNotComplete(_tenderId) nonReentrant {  
        require(_bidders.length == _complianceScores.length && _bidders.length == _qualityScores.length, "Array lengths must match");  
          
        address highestScorer;  
        uint256 highestScore = 0;  
          
        for (uint i = 0; i < _bidders.length; i++) {  
            uint256 totalScore = _complianceScores[i] + _qualityScores[i];  
              
            scores[_tenderId][_bidders[i]] = EvaluationScore({  
                bidder: _bidders[i],  
                complianceScore: _complianceScores[i],  
                qualityScore: _qualityScores[i],  
                totalScore: totalScore,  
                isValid: true  
            });  
              
            if (totalScore > highestScore) {  
                highestScore = totalScore;  
                highestScorer = _bidders[i];  
            }  
        }  
          
        awards[_tenderId] = AwardResult({  
            tenderId: _tenderId,  
            winner: highestScorer,  
            winningScore: highestScore,  
            finalized: false  
        });  
          
        evaluationComplete[_tenderId] = true;  
          
        emit ScoresSubmitted(_tenderId, msg.sender);  
        emit WinnerSelected(_tenderId, highestScorer, highestScore);  
    }  
      
    function finalizeAward(uint256 _tenderId) external onlyOwner {  
        require(evaluationComplete[_tenderId], "Evaluation not complete");  
        require(!awards[_tenderId].finalized, "Award already finalized");  
          
        awards[_tenderId].finalized = true;  
        emit AwardFinalized(_tenderId);  
    }  
      
    function getWinner(uint256 _tenderId) external view returns (address) {  
        require(evaluationComplete[_tenderId], "Evaluation not complete");  
        return awards[_tenderId].winner;  
    }  
      
    function getScore(uint256 _tenderId, address _bidder) external view returns (EvaluationScore memory) {  
        return scores[_tenderId][_bidder];  
    }  
      
    function updateOracle(address _newOracle) external onlyOwner {  
        oracleAddress = _newOracle;  
    }  
}
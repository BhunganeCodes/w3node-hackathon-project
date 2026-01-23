// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TenderScoringRegistry is Ownable {

    // -------------------------
    // Constructor
    // -------------------------
    constructor() Ownable(msg.sender) {}  // ✅ Pass deployer to base

    /// -------------------------
    /// Roles
    /// -------------------------
    address public scoringOracle;

    modifier onlyOracle() {
        require(msg.sender == scoringOracle, "Not authorized oracle");
        _;
    }

    /// -------------------------
    /// Data Structures
    /// -------------------------
    struct Score {
        uint16 totalScore;      // 0–10000 (2 decimal precision)
        bytes32 reportHash;     // Hash of JSON/PDF report
        bool exists;
    }

    mapping(uint256 => mapping(address => Score)) public scores;

    /// -------------------------
    /// Events
    /// -------------------------
    event OracleUpdated(address indexed oracle);
    event ScoreSubmitted(
        uint256 indexed tenderId,
        address indexed bidder,
        uint16 totalScore,
        bytes32 reportHash
    );

    /// -------------------------
    /// Admin Functions
    /// -------------------------
    function setScoringOracle(address oracle) external onlyOwner {
        require(oracle != address(0), "Invalid oracle");
        scoringOracle = oracle;
        emit OracleUpdated(oracle);
    }

    /// -------------------------
    /// Oracle Functions
    /// -------------------------
    function submitScore(
        uint256 tenderId,
        address bidder,
        uint16 totalScore,
        bytes32 reportHash
    ) external onlyOracle {
        require(bidder != address(0), "Invalid bidder");
        require(totalScore <= 10_000, "Score out of range");
        require(reportHash != bytes32(0), "Invalid report hash");
        require(!scores[tenderId][bidder].exists, "Score already submitted");

        scores[tenderId][bidder] = Score({
            totalScore: totalScore,
            reportHash: reportHash,
            exists: true
        });

        emit ScoreSubmitted(tenderId, bidder, totalScore, reportHash);
    }

    /// -------------------------
    /// View Functions
    /// -------------------------
    function getScore(uint256 tenderId, address bidder)
        external
        view
        returns (uint16 totalScore, bytes32 reportHash)
    {
        Score memory s = scores[tenderId][bidder];
        require(s.exists, "Score not found");
        return (s.totalScore, s.reportHash);
    }
}

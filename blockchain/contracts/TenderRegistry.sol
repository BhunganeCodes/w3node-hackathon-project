// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
* @title TenderScoringRegistry
* @notice Stores immutable AI evaluation scores on-chain
* @dev Full reports live off-chain (IPFS); only hashes are stored
*/
contract TenderScoringRegistry is Ownable {

    constructor() Ownable(msg.sender) {}

    /// -------------------------
    /// Roles
    /// -------------------------

    /// @notice Authorized AI oracle / backend
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

    /// tenderId => bidder => Score
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

    function getScore(
        uint256 tenderId,
        address bidder
    )
        external
        view
        returns (uint16 totalScore, bytes32 reportHash)
    {
        Score memory s = scores[tenderId][bidder];
        require(s.exists, "Score not found");
        return (s.totalScore, s.reportHash);
    }
}

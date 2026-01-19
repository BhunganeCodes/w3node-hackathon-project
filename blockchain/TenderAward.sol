// SPDX-License-Identifier: GPL-3.0  
pragma solidity ^0.8.26;  
  
contract TenderAward {  
    struct Bid {  
        address bidder;  
        string ipfsHash;  
        uint256 aiScore;  
        bool evaluated;  
    }  
      
    mapping(uint256 => mapping(address => Bid)) public tenderBids;  
    mapping(uint256 => address) public winners;  
      
    event BidSubmitted(uint256 tenderId, address bidder);  
    event ScoreSubmitted(uint256 tenderId, address bidder, uint256 score);  
      
    function submitBid(uint256 _tenderId, string memory _ipfsHash) public {  
        tenderBids[_tenderId][msg.sender] = Bid({  
            bidder: msg.sender,  
            ipfsHash: _ipfsHash,  
            aiScore: 0,  
            evaluated: false  
        });  
          
        emit BidSubmitted(_tenderId, msg.sender);  
    }  
      
    function submitAIScore(uint256 _tenderId, address _bidder, uint256 _score) public {  
        // Only authorized oracle can submit scores  
        tenderBids[_tenderId][_bidder].aiScore = _score;  
        tenderBids[_tenderId][_bidder].evaluated = true;  
          
        emit ScoreSubmitted(_tenderId, _bidder, _score);  
    }  
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface ITenderRegistry {
    function createTender(string calldata title) external returns (uint256);
    function acceptBid(uint256 tenderId, address bidder, uint256 amount) external;
}

contract TenderRegistry is ITenderRegistry {
    uint256 public nextTenderId;
    
    struct Tender {
        string title;
        address[] bidders;
        mapping(address => uint256) bids;
        bool exists;
    }

    mapping(uint256 => Tender) private tenders;

    event TenderCreated(uint256 indexed tenderId, string title);
    event BidAccepted(uint256 indexed tenderId, address indexed bidder, uint256 amount);

    function createTender(string calldata title) external returns (uint256) {
        uint256 tenderId = nextTenderId++;
        Tender storage t = tenders[tenderId];
        t.title = title;
        t.exists = true;
        emit TenderCreated(tenderId, title);
        return tenderId;
    }

    function acceptBid(uint256 tenderId, address bidder, uint256 amount) external {
        require(tenders[tenderId].exists, "Tender does not exist");
        Tender storage t = tenders[tenderId];
        if (t.bids[bidder] == 0) {
            t.bidders.push(bidder);
        }
        t.bids[bidder] = amount;
        emit BidAccepted(tenderId, bidder, amount);
    }

    // helper for tests
    function getBid(uint256 tenderId, address bidder) external view returns (uint256) {
        return tenders[tenderId].bids[bidder];
    }

    function getBidders(uint256 tenderId) external view returns (address[] memory) {
        return tenders[tenderId].bidders;
    }
}

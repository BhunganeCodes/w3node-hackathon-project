// SPDX-License-Identifier: GPL-3.0  
pragma solidity ^0.8.26;  
  
contract TenderRegistry {  
    struct Tender {  
        string title;  
        string description;  
        uint256 budget;  
        uint256 closingDate;  
        string ipfsHash;  
        address creator;  
        bool isActive;  
    }  
      
    mapping(uint256 => Tender) public tenders;  
    uint256 public tenderCounter;  
      
    event TenderCreated(uint256 tenderId, string title, address creator);  
      
    function createTender(  
        string memory _title,  
        string memory _description,  
        uint256 _budget,  
        uint256 _closingDate,  
        string memory _ipfsHash  
    ) public {  
        tenders[tenderCounter] = Tender({  
            title: _title,  
            description: _description,  
            budget: _budget,  
            closingDate: _closingDate,  
            ipfsHash: _ipfsHash,  
            creator: msg.sender,  
            isActive: true  
        });  
          
        emit TenderCreated(tenderCounter, _title, msg.sender);  
        tenderCounter++;  
    }  
}
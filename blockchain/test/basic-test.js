const { expect } = require("chai");  
const { ethers } = require("hardhat");  
  
describe("TenderChain Basic Flow", function () {  
  let tenderRegistry, tenderAward, treasuryEscrow, awardedTender;  
  let owner, bidder1, bidder2;  
  
  beforeEach(async function () {  
    [owner, bidder1, bidder2] = await ethers.getSigners();  
      
    // Deploy contracts  
    const TenderRegistry = await ethers.getContractFactory("TenderRegistry");  
    tenderRegistry = await TenderRegistry.deploy();  
      
    const TenderAward = await ethers.getContractFactory("TenderAward");  
    tenderAward = await TenderAward.deploy(tenderRegistry.address, owner.address);  
      
    const TreasuryEscrow = await ethers.getContractFactory("TreasuryEscrow");  
    treasuryEscrow = await TreasuryEscrow.deploy(tenderAward.address, ethers.constants.AddressZero);  
      
    const AwardedTender = await ethers.getContractFactory("AwardedTender");  
    awardedTender = await AwardedTender.deploy();  
  });  
  
  it("Should create a tender and accept bids", async function () {  
    // Create tender  
    const tx = await tenderRegistry.createTender(  
      "Test Tender",  
      "Description",  
      Math.floor(Date.now() / 1000) + 86400, // 24 hours from now  
      "QmTestHash"  
    );  
      
    const receipt = await tx.wait();  
    const tenderId = receipt.events[0].args.tenderId;  
      
    expect(await tenderRegistry.getTender(tenderId)).to.not.be.undefined;  
      
    // Submit bid  
    await tenderRegistry.connect(bidder1).submitBid(tenderId, "QmBidHash");  
      
    const bidders = await tenderRegistry.getBidders(tenderId);  
    expect(bidders).to.include(bidder1.address);  
  });  
});
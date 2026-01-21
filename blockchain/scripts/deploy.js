async function main() {  
  // Deploy TenderRegistry  
  const TenderRegistry = await ethers.getContractFactory("TenderRegistry");  
  const tenderRegistry = await TenderRegistry.deploy();  
  await tenderRegistry.deployed();  
  console.log("TenderRegistry deployed to:", tenderRegistry.address);  
  
  // Deploy TenderAward  
  const TenderAward = await ethers.getContractFactory("TenderAward");  
  const tenderAward = await TenderAward.deploy(  
    tenderRegistry.address,  
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // Mock oracle address  
  );  
  await tenderAward.deployed();  
  console.log("TenderAward deployed to:", tenderAward.address);  
  
  // Deploy TreasuryEscrow  
  const TreasuryEscrow = await ethers.getContractFactory("TreasuryEscrow");  
  const treasuryEscrow = await TreasuryEscrow.deploy(  
    tenderAward.address,  
    "0x5FbDB2315678afecb367f032d93F642f64180aa3" // Mock token address  
  );  
  await treasuryEscrow.deployed();  
  console.log("TreasuryEscrow deployed to:", treasuryEscrow.address);  
  
  // Deploy AwardedTender  
  const AwardedTender = await ethers.getContractFactory("AwardedTender");  
  const awardedTender = await AwardedTender.deploy();  
  await awardedTender.deployed();  
  console.log("AwardedTender deployed to:", awardedTender.address);  
  
  // Save addresses to frontend config  
  const fs = require('fs');  
  const contractAddresses = {  
    TenderRegistry: tenderRegistry.address,  
    TenderAward: tenderAward.address,  
    TreasuryEscrow: treasuryEscrow.address,  
    AwardedTender: awardedTender.address  
  };  
    
  fs.writeFileSync(  
    '../frontend/src/contracts/addresses.json',  
    JSON.stringify(contractAddresses, null, 2)  
  );  
}  
  
main()  
  .then(() => process.exit(0))  
  .catch((error) => {  
    console.error(error);  
    process.exit(1);  
  });
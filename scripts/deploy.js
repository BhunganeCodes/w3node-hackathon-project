const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting TenderChain AI deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("");

  // Deploy TenderRegistry
  console.log("📝 Deploying TenderRegistry...");
  const TenderRegistry = await ethers.getContractFactory("TenderRegistry");
  const tenderRegistry = await TenderRegistry.deploy();
  await tenderRegistry.deployed();
  console.log("✅ TenderRegistry deployed to:", tenderRegistry.address);
  console.log("");

  // Deploy TreasuryEscrow
  console.log("💰 Deploying TreasuryEscrow...");
  const TreasuryEscrow = await ethers.getContractFactory("TreasuryEscrow");
  const treasuryEscrow = await TreasuryEscrow.deploy(tenderRegistry.address);
  await treasuryEscrow.deployed();
  console.log("✅ TreasuryEscrow deployed to:", treasuryEscrow.address);
  console.log("");

  // Grant roles
  console.log("🔐 Setting up roles...");
  
  // Grant TREASURY_ROLE to deployer
  const TREASURY_ROLE = await tenderRegistry.TREASURY_ROLE();
  await tenderRegistry.grantRole(TREASURY_ROLE, deployer.address);
  console.log("✅ Granted TREASURY_ROLE to deployer");

  // Grant AI_ORACLE_ROLE (you'll need to set this to your AI backend address)
  const AI_ORACLE_ROLE = await tenderRegistry.AI_ORACLE_ROLE();
  
  // For demo purposes, granting to deployer - in production, use dedicated oracle address
  const AI_ORACLE_ADDRESS = process.env.AI_ORACLE_ADDRESS || deployer.address;
  await tenderRegistry.grantRole(AI_ORACLE_ROLE, AI_ORACLE_ADDRESS);
  console.log("✅ Granted AI_ORACLE_ROLE to:", AI_ORACLE_ADDRESS);
  
  // Grant TREASURY_ROLE in escrow contract
  await treasuryEscrow.grantRole(TREASURY_ROLE, deployer.address);
  console.log("✅ Granted TREASURY_ROLE in escrow contract");
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TenderRegistry: {
        address: tenderRegistry.address,
        transactionHash: tenderRegistry.deployTransaction.hash,
      },
      TreasuryEscrow: {
        address: treasuryEscrow.address,
        transactionHash: treasuryEscrow.deployTransaction.hash,
      },
    },
    roles: {
      treasury: deployer.address,
      aiOracle: AI_ORACLE_ADDRESS,
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(
    deploymentsDir,
    `${hre.network.name}-deployment.json`
  );
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);
  console.log("");

  // Save frontend config
  const frontendConfig = {
    REACT_APP_TENDER_REGISTRY_ADDRESS: tenderRegistry.address,
    REACT_APP_TREASURY_ESCROW_ADDRESS: treasuryEscrow.address,
    REACT_APP_NETWORK_ID: (await deployer.provider.getNetwork()).chainId,
  };

  const frontendConfigPath = path.join(__dirname, "../frontend/.env.local");
  const configContent = Object.entries(frontendConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  
  fs.writeFileSync(frontendConfigPath, configContent);
  console.log("⚙️ Frontend config saved to:", frontendConfigPath);
  console.log("");

  // Save backend config
  const backendConfig = {
    TENDER_REGISTRY_ADDRESS: tenderRegistry.address,
    TREASURY_ESCROW_ADDRESS: treasuryEscrow.address,
    AI_ORACLE_ADDRESS: AI_ORACLE_ADDRESS,
    NETWORK: hre.network.name,
  };

  const backendConfigPath = path.join(__dirname, "../backend/.env.local");
  const backendContent = Object.entries(backendConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  
  fs.writeFileSync(backendConfigPath, backendContent);
  console.log("🤖 Backend config saved to:", backendConfigPath);
  console.log("");

  // Copy ABIs to frontend
  const artifactsDir = path.join(__dirname, "../artifacts/contracts");
  const frontendContractsDir = path.join(__dirname, "../frontend/src/contracts");
  
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  // Copy TenderRegistry ABI
  const tenderRegistryArtifact = require(path.join(
    artifactsDir,
    "TenderRegistry.sol/TenderRegistry.json"
  ));
  fs.writeFileSync(
    path.join(frontendContractsDir, "TenderRegistry.json"),
    JSON.stringify(tenderRegistryArtifact, null, 2)
  );

  // Copy TreasuryEscrow ABI
  const treasuryEscrowArtifact = require(path.join(
    artifactsDir,
    "TreasuryEscrow.sol/TreasuryEscrow.json"
  ));
  fs.writeFileSync(
    path.join(frontendContractsDir, "TreasuryEscrow.json"),
    JSON.stringify(treasuryEscrowArtifact, null, 2)
  );

  console.log("📋 ABIs copied to frontend");
  console.log("");

  // Verification instructions
  console.log("========================================");
  console.log("🎉 Deployment Complete!");
  console.log("========================================");
  console.log("\n📝 Contract Addresses:");
  console.log("  TenderRegistry:", tenderRegistry.address);
  console.log("  TreasuryEscrow:", treasuryEscrow.address);
  console.log("\n🔗 Network:", hre.network.name);
  console.log("\n📌 Next Steps:");
  console.log("1. Verify contracts on block explorer:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${tenderRegistry.address}`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${treasuryEscrow.address} ${tenderRegistry.address}`);
  console.log("\n2. Update AI Oracle private key in backend/.env");
  console.log("\n3. Start the frontend:");
  console.log("   cd frontend && npm start");
  console.log("\n4. Start the backend:");
  console.log("   cd backend && python main.py");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
import { ethers } from 'ethers';  
import detectEthereumProvider from '@metamask/detect-provider';  
import addresses from './addresses.json';  
  
// Contract ABIs (import from compiled artifacts)  
import TenderRegistryArtifact from '../../blockchain/artifacts/contracts/TenderRegistry.sol/TenderRegistry.json';  
import TenderAwardArtifact from '../../blockchain/artifacts/contracts/TenderAward.sol/TenderAward.json';  
import TreasuryEscrowArtifact from '../../blockchain/artifacts/contracts/TreasuryEscrow.sol/TreasuryEscrow.json';  
import AwardedTenderArtifact from '../../blockchain/artifacts/contracts/AwardedTender.sol/AwardedTender.json';  
  
export const LOCAL_NETWORK_ID = '31337';  
export const LOCAL_RPC_URL = 'http://127.0.0.1:8545';  
  
export class Web3Service {  
  constructor() {  
    this.provider = null;  
    this.signer = null;  
    this.contracts = {};  
  }  
  
  async initialize() {  
    // Detect MetaMask  
    this.provider = await detectEthereumProvider();  
      
    if (!this.provider) {  
      throw new Error('MetaMask not detected');  
    }  
  
    // Request account access  
    await this.provider.request({ method: 'eth_requestAccounts' });  
      
    // Create signer  
    this.signer = await this.provider.getSigner();  
      
    // Initialize contracts  
    this.contracts.tenderRegistry = new ethers.Contract(  
      addresses.TenderRegistry,  
      TenderRegistryArtifact.abi,  
      this.signer  
    );  
      
    this.contracts.tenderAward = new ethers.Contract(  
      addresses.TenderAward,  
      TenderAwardArtifact.abi,  
      this.signer  
    );  
      
    this.contracts.treasuryEscrow = new ethers.Contract(  
      addresses.TreasuryEscrow,  
      TreasuryEscrowArtifact.abi,  
      this.signer  
    );  
      
    this.contracts.awardedTender = new ethers.Contract(  
      addresses.AwardedTender,  
      AwardedTenderArtifact.abi,  
      this.signer  
    );  
  }  
  
  async switchToLocalNetwork() {  
    try {  
      await this.provider.request({  
        method: 'wallet_switchEthereumChain',  
        params: [{ chainId: `0x${parseInt(LOCAL_NETWORK_ID).toString(16)}` }],  
      });  
    } catch (switchError) {  
      // This error code indicates that the chain has not been added to MetaMask  
      if (switchError.code === 4902) {  
        await this.provider.request({  
          method: 'wallet_addEthereumChain',  
          params: [  
            {  
              chainId: `0x${parseInt(LOCAL_NETWORK_ID).toString(16)}`,  
              chainName: 'TenderChain Local',  
              rpcUrls: [LOCAL_RPC_URL],  
              nativeCurrency: {  
                name: 'ETH',  
                symbol: 'ETH',  
                decimals: 18,  
              },  
            },  
          ],  
        });  
      } else {  
        throw switchError;  
      }  
    }  
  }  
}  
  
export const web3Service = new Web3Service();
import { ethers } from 'ethers';  
  
export const connectWallet = async () => {  
  if (typeof window.ethereum !== 'undefined') {  
    try {  
      await window.ethereum.request({ method: 'eth_requestAccounts' });  
      const provider = new ethers.BrowserProvider(window.ethereum);  
      const signer = await provider.getSigner();  
      return { provider, signer };  
    } catch (error) {  
      console.error('Error connecting wallet:', error);  
      throw error;  
    }  
  } else {  
    throw new Error('MetaMask is not installed');  
  }  
};  
  
export const getContract = (address: string, abi: any, signer: any) => {  
  return new ethers.Contract(address, abi, signer);  
};
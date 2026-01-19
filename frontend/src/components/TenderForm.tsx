// Tender Form Component with Blockchain Integration  
  
import { motion } from "framer-motion";  
import { FileText, Calendar, Coins } from "lucide-react";  
import { ethers } from 'ethers';  
import { useState } from 'react';  
  
// Contract ABI (you'll need to generate this after deploying contracts)  
const TENDER_REGISTRY_ABI = [  
  {  
    "inputs": [  
      {"internalType": "string", "name": "_title", "type": "string"},  
      {"internalType": "string", "name": "_description", "type": "string"},  
      {"internalType": "uint256", "name": "_budget", "type": "uint256"},  
      {"internalType": "uint256", "name": "_closingDate", "type": "uint256"},  
      {"internalType": "string", "name": "_ipfsHash", "type": "string"}  
    ],  
    "name": "createTender",  
    "outputs": [],  
    "stateMutability": "nonpayable",  
    "type": "function"  
  }  
];  
  
export default function TenderForm() {  
  const [isSubmitting, setIsSubmitting] = useState(false);  
  const [formData, setFormData] = useState({  
    title: '',  
    description: '',  
    budget: '',  
    closingDate: '',  
    aiCriteria: ''  
  });  
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {  
    const { name, value } = e.target;  
    setFormData(prev => ({  
      ...prev,  
      [name]: value  
    }));  
  };  
  
  const uploadToIPFS = async (data: any) => {  
    try {  
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
          'Authorization': `Bearer ${process.env.REACT_APP_PINATA_JWT}`,  
        },  
        body: JSON.stringify(data),  
      });  
        
      const result = await response.json();  
      return result.IpfsHash;  
    } catch (error) {  
      console.error('Error uploading to IPFS:', error);  
      throw error;  
    }  
  };  
  
  const handleSubmit = async (e: React.FormEvent) => {  
    e.preventDefault();  
    setIsSubmitting(true);  
      
    try {  
      // Connect to wallet  
      if (typeof window.ethereum === 'undefined') {  
        throw new Error('MetaMask is not installed');  
      }  
        
      await window.ethereum.request({ method: 'eth_requestAccounts' });  
      const provider = new ethers.BrowserProvider(window.ethereum);  
      const signer = await provider.getSigner();  
        
      // Contract interaction  
      const contractAddress = process.env.REACT_APP_TENDER_REGISTRY_ADDRESS;  
      if (!contractAddress) {  
        throw new Error('Contract address not configured');  
      }  
        
      const contract = new ethers.Contract(  
        contractAddress,  
        TENDER_REGISTRY_ABI,  
        signer  
      );  
        
      // Prepare data for IPFS  
      const ipfsData = {  
        title: formData.title,  
        description: formData.description,  
        aiCriteria: formData.aiCriteria,  
        createdAt: new Date().toISOString()  
      };  
        
      // Upload to IPFS first  
      const ipfsHash = await uploadToIPFS(ipfsData);  
        
      // Convert budget to wei and closing date to timestamp  
      const budgetInWei = ethers.parseEther(formData.budget);  
      const closingTimestamp = Math.floor(new Date(formData.closingDate).getTime() / 1000);  
        
      // Create tender on blockchain  
      const tx = await contract.createTender(  
        formData.title,  
        formData.description,  
        budgetInWei,  
        closingTimestamp,  
        ipfsHash  
      );  
        
      await tx.wait();  
      console.log('Tender created successfully');  
        
      // Reset form  
      setFormData({  
        title: '',  
        description: '',  
        budget: '',  
        closingDate: '',  
        aiCriteria: ''  
      });  
        
      alert('Tender deployed successfully!');  
    } catch (error) {  
      console.error('Error creating tender:', error);  
      alert(`Error: ${error.message}`);  
    } finally {  
      setIsSubmitting(false);  
    }  
  };  
  
  return (  
    <motion.div  
      initial={{ opacity: 0, y: 30 }}  
      animate={{ opacity: 1, y: 0 }}  
      transition={{ duration: 0.6 }}  
      className="glass-card"  
    >  
      <h2 className="form-title">Create New Tender</h2>  
  
      <form className="form-grid" onSubmit={handleSubmit}>  
        <div className="input-group">  
          <label>  
            <FileText size={16} /> Tender Title  
          </label>  
          <input   
            type="text"   
            name="title"  
            value={formData.title}  
            onChange={handleInputChange}  
            placeholder="Supply of Medical Equipment"   
            required  
          />  
        </div>  
  
        <div className="input-group">  
          <label>Description</label>  
          <textarea   
            name="description"  
            value={formData.description}  
            onChange={handleInputChange}  
            placeholder="Detailed scope of work..."   
            required  
          />  
        </div>  
  
        <div className="form-row">  
          <div className="input-group">  
            <label>  
              <Coins size={16} /> Budget (ZAR)  
            </label>  
            <input   
              type="number"   
              name="budget"  
              value={formData.budget}  
              onChange={handleInputChange}  
              placeholder="5000000"   
              required  
            />  
          </div>  
  
          <div className="input-group">  
            <label>  
              <Calendar size={16} /> Closing Date  
            </label>  
            <input   
              type="date"   
              name="closingDate"  
              value={formData.closingDate}  
              onChange={handleInputChange}  
              required   
            />  
          </div>  
        </div>  
  
        <div className="input-group">  
          <label>AI Evaluation Criteria</label>  
          <textarea   
            name="aiCriteria"  
            value={formData.aiCriteria}  
            onChange={handleInputChange}  
            placeholder="Compliance, pricing, experience, BBBEE..."   
            required  
          />  
        </div>  
  
        <button   
          type="submit"   
          className="primary-btn"   
          disabled={isSubmitting}  
        >  
          {isSubmitting ? 'Deploying...' : 'Deploy Tender'}  
        </button>  
      </form>  
    </motion.div>  
  );  
}
// Tender Form COmponent

import { motion } from "framer-motion";
import { FileText, Calendar, Coins } from "lucide-react";
import { ethers } from "ethers";  
import { useState } from "react"; 

export default function TenderForm() {

  const [isSubmitting, setIsSubmitting] = useState(false);  
    
  const handleSubmit = async (e: React.FormEvent) => {  
    e.preventDefault();  
    setIsSubmitting(true);  
      
    try {  
      // Connect to wallet  
      const provider = new ethers.BrowserProvider(window.ethereum);  
      const signer = await provider.getSigner();  
        
      // Contract interaction  
      const contract = new ethers.Contract(  
        'TENDER_REGISTRY_ADDRESS',  
        TENDER_REGISTRY_ABI,  
        signer  
      );  
        
      // Upload to IPFS first  
      const ipfsHash = await uploadToIPFS(formData);  
        
      // Create tender on blockchain  
      const tx = await contract.createTender(  
        formData.title,  
        formData.description,  
        formData.budget,  
        formData.closingDate,  
        ipfsHash  
      );  
        
      await tx.wait();  
      console.log('Tender created successfully');  
    } catch (error) {  
      console.error('Error creating tender:', error);  
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

      <form className="form-grid">
        <div className="input-group">
          <label>
            <FileText size={16} /> Tender Title
          </label>
          <input type="text" placeholder="Supply of Medical Equipment" />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea placeholder="Detailed scope of work..." />
        </div>

        <div className="form-row">
          <div className="input-group">
            <label>
              <Coins size={16} /> Budget (ZAR)
            </label>
            <input type="number" placeholder="5000000" />
          </div>

          <div className="input-group">
            <label>
              <Calendar size={16} /> Closing Date
            </label>
            <input type="date" />
          </div>
        </div>

        <div className="input-group">
          <label>AI Evaluation Criteria</label>
          <textarea placeholder="Compliance, pricing, experience, BBBEE..." />
        </div>

        <button className="primary-btn">Deploy Tender</button>
      </form>
    </motion.div>
  );
}

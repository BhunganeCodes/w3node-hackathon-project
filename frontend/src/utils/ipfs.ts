export const uploadToIPFS = async (data: any) => {  
  try {  
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {  
      method: 'POST',  
      headers: {  
        'Authorization': `Bearer ${process.env.REACT_APP_PINATA_JWT}`,  
      },  
      body: data,  
    });  
      
    const result = await response.json();  
    return result.IpfsHash;  
  } catch (error) {  
    console.error('Error uploading to IPFS:', error);  
    throw error;  
  }  
};
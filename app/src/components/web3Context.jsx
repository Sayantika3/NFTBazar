// context/Web3Context.jsx
import React, { createContext, useState, useEffect } from "react";
import ABI from "../abi/nft.json";
import MABI from "../abi/marketplace.json";
import { ethers } from "ethers";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    try{
        if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await provider.getSigner();
      setSigner(_signer);
    }
}
    catch(error){
        alert("Please install metamask");
    }
    
  };

  useEffect(() => {
    connectWallet(); // Auto-connect if available
  }, []);
  useEffect(()=>{
          if (window.ethereum) {
          window.ethereum.on('accountsChanged', () => {
          window.location.reload();
          });
          }
  
      },[])

  return (
    <Web3Context.Provider value={{ signer, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

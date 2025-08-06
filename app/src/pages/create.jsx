import React, { useEffect, useState,useContext } from "react";
import axios from 'axios';
import { useLocation } from "react-router-dom";
import '../css/create.css';
import ABI from "../abi/nft.json";
import MABI from "../abi/marketplace.json";
import { ethers } from "ethers";
import { Web3Context } from "../components/web3Context";


function Create() {

  const nftAdd=//"<nft contract address>";
  const Madd=//"<marketplace contract address>";
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const { signer } = useContext(Web3Context);
  
  
  

//console.log(account);
 
    
const uploadToIpfs = async () => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const resFile = await axios({
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data: formData,
      headers: {
        pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
        pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
        "Content-Type": "multipart/form-data",
      },
    });

    const imgurl = `ipfs://${resFile.data.IpfsHash}`;

    const metadata = {
      name,
      description,
      price,
      image: imgurl,
    };

    const resJSON = await axios({
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data: metadata,
      headers: {
        pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
        pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const finalURI = `ipfs://${resJSON.data.IpfsHash}`;
    return finalURI;
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw error;
  }
};

useEffect(()=>{
        if (window.ethereum) {
        window.ethereum.on('accountsChanged', () => {
        window.location.reload();
        });
        }

    },[])

const createNft = async (e) => {
  e.preventDefault();
  try {
    if (!signer) {
      console.error("no account found");
      return;
    }

    const uri = await uploadToIpfs(); // 🟢 use local variable
    alert("NFT Metadata uploaded");

    const nftcontract = new ethers.Contract(nftAdd, ABI, signer);
    const tx = await nftcontract.mint(uri);
    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.hash);

    const tokenid = (await nftcontract.tokenid()).toString();
    console.log("Token ID:", tokenid);

    const marketcontract = new ethers.Contract(Madd, MABI, signer);
    const amount = ethers.parseEther(price.toString());

    await (await nftcontract.setApprovalForAll(Madd, true)).wait();
    await (await marketcontract.makeItem(nftAdd, tokenid, amount)).wait();

    alert("NFT Created & Listed Successfully");
  } catch (error) {
    console.log("Error in createNft:", error);
  }
};



  return (
    <div className="form-container">
      <h2 className="form-title">Create NFT</h2>
      <form  className="upload-form" onSubmit={createNft}> 
        <label className="form-label">
          Choose File
          <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
        </label>

        <label className="form-label">
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className="form-label">
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>

        <label className="form-label">
          Price (ETH)
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </label>

        <button type="submit" className="submit-button">Create & List</button>
      </form>
     
    </div>
  );
}

export default Create;

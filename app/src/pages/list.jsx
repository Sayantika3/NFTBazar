import React, { useEffect, useState,useContext } from "react";
import axios from 'axios';
import { useLocation } from "react-router-dom";
import '../css/home.css'
import { ethers } from "ethers";
import MABI from '../abi/marketplace.json'
import ABI from '../abi/nft.json'
import { Web3Context } from "../components/web3Context";


function List(){
    const { signer} = useContext(Web3Context);
    const [items,setItem]=useState([]);
    const [nftcontract,setNft]=useState(null);
    const [marketcontract,setMarket]=useState(null);
    const [loading,setLoading]=useState(true);
    const nftAdd=//"<nft contract address>";
  const Madd=//"<marketplace contract address>";

    useEffect(()=>{
       if (signer) {
        const market = new ethers.Contract(
          Madd,
          MABI,
          signer
        );
        const nft = new ethers.Contract(
          nftAdd,
          ABI,
          signer
        );
        setMarket(market);
        setNft(nft);
        
      
    }
    },[signer]);
    useEffect(()=>{
        if (window.ethereum) {
        window.ethereum.on('accountsChanged', () => {
        window.location.reload();
  });
}

    },[])
    
    useEffect(()=>{
        if (nftcontract && marketcontract){ loadItems();}
       
    },[nftcontract,marketcontract])

    let Items=[];

     const loadItems=async()=>{
        const itemCount=(await marketcontract.itemCount()).toString();
        for(let i=1;i<=itemCount;i++){
            const item= await marketcontract.items(i);
            if(!item.sold){
                //get url from nft contract
                let uri=await nftcontract.tokenURI(item.tokenId);
                if (uri.startsWith("ipfs://")) {
                    uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
                    }
                //fetch response from url
                const response=await fetch(uri);
                if (uri){
                    const metadata= await response.json();

                //get total price from marketplace
                const totalPrice=await marketcontract.getTotalPrice(item.itemId)
                const onlyHash=(metadata.image).substring(7);
                const imageurl=`https://gateway.pinata.cloud/ipfs/${onlyHash}`;
                
                //add item to  the item array
                if(item.seller===signer.address){
                    Items.push({
                    totalPrice,
                    itemId: item.itemId,
                    seller: item.seller,
                    name: metadata.name,
                    description: metadata.description,
                    image: imageurl
                })
                }
                console.log(metadata.image)
                }
                
            }
        }
        setItem(Items);
        setLoading(false);

    }

    return(
        <div className="nft-container">
    <h1 className="text-center">Your Listed NFTs</h1>

    {loading ? (
      <div className="text-center">
        <p>Loading your NFTs...</p>
        {/* Optional: Add a CSS spinner */}
        <div className="spinner" />
      </div>
    ) : items.length > 0 ? (
      <div className="nft-grid">
        {items.map((item, idx) => (
          <div key={idx} className="nft-card">
            <img src={item.image} alt={item.name} className="nft-image" />
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p><strong>Price:</strong> {ethers.formatEther(item.totalPrice)} ETH</p>
          </div>
        ))}
      </div>
    ) : (
      <div>No Item Listed</div>
    )}
  </div>
    )
}

export default List;
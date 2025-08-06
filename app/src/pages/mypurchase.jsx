import React, { useEffect, useState, useContext } from "react";
import '../css/home.css'
import { ethers } from "ethers";
import MABI from '../abi/marketplace.json';
import ABI from '../abi/nft.json';
import { Web3Context } from "../components/web3Context";

function MyPurchase() {
  const { signer } = useContext(Web3Context);
  const [items, setPurchase] = useState([]);
  const [nftcontract, setNft] = useState(null);
  const [marketcontract, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
const nftAdd=//"<nft contract address>";
  const Madd=//"<marketplace contract address>";  let Purchase=[];

  useEffect(() => {
    if (signer) {
      const market = new ethers.Contract(Madd, MABI, signer);
      const nft = new ethers.Contract(nftAdd, ABI, signer);
      setMarket(market);
      setNft(nft);
    }
  }, [signer]);
  useEffect(()=>{
          if (window.ethereum) {
          window.ethereum.on('accountsChanged', () => {
          window.location.reload();
          });
          }
  
      },[])

  useEffect(() => {
    if (nftcontract && marketcontract) getBoughtEvents();
  }, [nftcontract, marketcontract]);

  const getBoughtEvents = async () => {
    // try {
    //   const address = await signer.getAddress();

    //   // 🔥 Split large queries into smaller ranges
    //   const latestBlock = await signer.provider.getBlockNumber();
    //   const events = [];

    //   const batchSize = 10000;
    //   for (let fromBlock = 0; fromBlock <= latestBlock; fromBlock += batchSize) {
    //     const toBlock = Math.min(fromBlock + batchSize - 1, latestBlock);
    //     const filter = marketcontract.filters.Bought(
    //       null,
    //       null,
    //       null,
    //       null,
    //       null,
    //       address
    //     );
    //     const batchEvents = await marketcontract.queryFilter(filter, fromBlock, toBlock);
    //     events.push(...batchEvents);
    //   }

    //   const purchases = await Promise.all(events.map(async (event) => {
    //     const i = event.args;
    //     let uri = await nftcontract.tokenURI(i.tokenId);
    //     if (uri.startsWith("ipfs://")) {
    //       uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    //     }

    //     const response = await fetch(uri);
    //     const metadata = await response.json();

    //     const totalPrice = await marketcontract.getTotalPrice(i.itemId);
    //     const onlyHash = metadata.image.substring(7);
    //     const imageurl = `https://gateway.pinata.cloud/ipfs/${onlyHash}`;

    //     return {
    //       totalPrice,
    //       itemId: i.itemId,
    //       price: i.price,
    //       name: metadata.name,
    //       description: metadata.description,
    //       image: imageurl
    //     };
    //   }));

    //   setPurchase(purchases);
    // } 
    try{
        const itemCount=(await marketcontract.itemCount()).toString();
        for(let i=1;i<=itemCount;i++){
        const item= await marketcontract.items(i);
        if(item.sold){
            let owner=await nftcontract.ownerOf(item.tokenId);
            
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
                if(owner===signer.address){
                
          
                    Purchase.push({
                    totalPrice,
                    itemId: item.itemId,
                    seller: item.seller,
                    name: metadata.name,
                    description: metadata.description,
                    image: imageurl
                })
              }
             } }
             }
             setPurchase(Purchase);
        }
    catch (err) {
      console.error("Failed to fetch purchased NFTs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="nft-container">
    <h1 className="text-center">My Purchases</h1>

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
      <div>No Item Purchased</div>
    )}
  </div>
  );
}

export default MyPurchase;

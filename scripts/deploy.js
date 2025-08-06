const { ethers } = require("hardhat");

async function main() {
    await hre.run("compile");

    const MyNFT= await ethers.getContractFactory("nft");
    const Market=await ethers.getContractFactory("marketplace");
    
    const contract = await MyNFT.deploy();
    const Mcontract=await Market.deploy(2);

    await contract.waitForDeployment();
    await Mcontract.waitForDeployment();
    console.log("NFT deployed to address:",await contract.getAddress());
    console.log("Marketplace deployed to address:",await Mcontract.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
    
// NFT deployed to address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
// Marketplace deployed to address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
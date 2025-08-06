const {expect} = require('chai');

toWei= (n) => {
    return ethers.parseEther(n.toString());   }
fromWei= (n) => {
    return ethers.formatEther(n);
}


describe('NFT Market', function () {
    let deployer, add1, add2,nft , market;
    let feePercent = 1; 
    let URI="sample uri";
    beforeEach(async function () {
        
        // We get the contract to deploy
        const NFT = await ethers.getContractFactory('nft');
        const Market = await ethers.getContractFactory('marketplace');

        //get signer account
        [deployer,add1,add2] = await ethers.getSigners();

        //deploy contract
        nft = await NFT.deploy();
        market = await Market.deploy(feePercent);

    });
    describe('Deployment', function () {
        it('name and symbol of nft should be correct', async function () {
            expect(await nft.name()).to.equal("hello");
            expect(await nft.symbol()).to.equal("MTK");
        });
        it('should track fee account and fee percent', async function () {
            expect(await market.feeAccount()).to.equal(deployer.address);
            expect(await market.feePercent()).to.equal(feePercent);
        });

    });
    describe('Minting NFTs', function () {
        it('should track each minted NFT', async function () {
            //mint nft
            await nft.connect(add1).mint(URI);
            expect(await nft.tokenid()).to.equal(1);
            expect(await nft.balanceOf(add1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);

            await nft.connect(add2).mint(URI);
            expect(await nft.tokenid()).to.equal(2); 
            expect(await nft.balanceOf(add2.address)).to.equal(1);//no of nfft add1 has
            expect(await nft.tokenURI(2)).to.equal(URI);
        });
        
    });
    describe('Making marketplace items', function () {
        
        beforeEach(async function () {
            //add1 mint nft
            await nft.connect(add1).mint(URI);
            //add1 approve market to spend NFT
            await nft.connect(add1).setApprovalForAll(market.getAddress(), true);
             nftAddress = await nft.getAddress();
             marketAddress = await market.getAddress();
        });
        it('should track newly created item, transfer NFT from seller to market and emit Offered event', async function () {
            //add1 create item
            await expect(market.connect(add1).makeItem(nft.getAddress(), 1, toWei(1)))
                .to.emit(market, 'Offered')
                .withArgs(1, nft.getAddress(), 1, toWei(1), add1.address);
            const owner1 = await nft.ownerOf(1);
            expect(owner1).to.equal(marketAddress); // Use stored address
            expect(await market.itemCount()).to.equal(1);
            
            const item = await market.items(1);
            expect(item.itemId).to.equal(1);
            expect(item.nft).to.equal(nftAddress); // Use stored address
            expect(item.tokenId).to.equal(1);
            expect(item.price).to.equal(toWei(1));
            expect(item.sold).to.equal(false);
             
        });

        it('should fail if price is set to zero', async function () {
            await expect(market.connect(add1).makeItem(nft.getAddress(), 1, 0)).to.be.revertedWith("Price must be greater than 0");
        });
       
    });
    describe('Purchase items', function () {   
        let price = toWei(2);   
        let totalPrice;
        beforeEach(async function () {
            //add1 mint nft
            await nft.connect(add1).mint(URI);
            //add1 approve market to spend NFT
            await nft.connect(add1).setApprovalForAll(market.getAddress(), true);
            //add1 create item
            await market.connect(add1).makeItem(nft.getAddress(), 1, price);
            totalPrice =await market.getTotalPrice(1);
        });
        
        it("should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit Bought event", async function () {     
              
            const sellerInitialEthBalance = await ethers.provider.getBalance(add1.address);
            const feeAccountInitialEthBalance = await ethers.provider.getBalance(deployer.address);
            

            //add2 buy item
            await expect(market.connect(add2).purchaseItem(1, {value: totalPrice}))
                .to.emit(market, 'Bought')
                .withArgs(1, nft.getAddress(), 1, price, add1.address, add2.address);

            const sellerFinalEthBalance = await ethers.provider.getBalance(add1.address);
            const feeAccountFinalEthBalance =await ethers.provider.getBalance(deployer.address);

            expect(await nft.ownerOf(1)).to.equal(add2.address);
            const item = await market.items(1);
            expect(item.sold).to.equal(true);

            //seller should receive price minus fee
            expect(sellerFinalEthBalance).to.equal(sellerInitialEthBalance+price);
            //fee account should receive fee
            expect(feeAccountFinalEthBalance).to.equal(feeAccountInitialEthBalance+(totalPrice-price));
        });
        it ("should pass all the requires",async function () {
             await expect(market.connect(add2).purchaseItem(0, {value: totalPrice}))
                .to.be.revertedWith("Item does not exist");
            })
        
        
    });
  
});
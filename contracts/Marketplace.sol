// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract marketplace is ReentrancyGuard{

    //state variables
    address payable public immutable feeAccount; //account recieves the fees
    uint public immutable feePercent; //fee percentage on each sales
    uint public itemCount;
    struct Item{
        uint itemId;
        IERC721 nft; //interface of NFT contract
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }
    event Offered(
        uint indexed itemId,
        address indexed nft,
        uint indexed tokenId,
        uint price,
        address seller
    );
    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );
    mapping(uint => Item) public items;

    //initialize with constructor
    constructor(uint _feePercent){
        feeAccount=payable(msg.sender);
        feePercent= _feePercent;

    }

    //from the frontend user will pass the address of nft contract 
    //here it will automatically converted to ERC721 instance
    function makeItem(IERC721  _nft, uint _tokenId, uint _price) external nonReentrant{
        require(_price > 0, "Price must be greater than 0");
        require(_nft.ownerOf(_tokenId) == msg.sender , "You do not own this NFT");
        require(_nft.getApproved(_tokenId) == address(this) || _nft.isApprovedForAll(msg.sender, address(this)), "NFT not approved for marketplace");

        //create the item
        //increment the item count
        itemCount++;
        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );

        //transfer the NFT to the marketplace contract
        _nft.transferFrom(msg.sender, address(this), _tokenId);

        //emit the event
        emit Offered(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            msg.sender
        );
    }

    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "Item does not exist");
        require(msg.value >= totalPrice, "Not enough ether to cover item price and fees");
        require(!item.sold, "Item already sold");
        require(item.seller != msg.sender, "You cannot buy your own item");

        //transfer the funds to the seller
        item.seller.transfer(item.price);
        //pay fee to the fee account
        feeAccount.transfer(totalPrice - item.price);
        //transfer the NFT to the buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        //mark the item as sold
        item.sold = true;

        //emit the event
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );

    }
    function getTotalPrice(uint _itemId) public view returns(uint){
        // get the item Price
        uint totalPrice = items[_itemId].price;
        // calculate the fee
        uint fee = (totalPrice * feePercent) / 100;
        return fee + totalPrice;
    }


}

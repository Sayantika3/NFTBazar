// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract nft is ERC721URIStorage{
    uint public tokenid=0;

    //The token name and symbol via the ERC721 constructor.
    constructor() ERC721("hello", "MTK"){}

    function mint(string memory _tokenURI) external returns(uint){
        tokenid++;

        _safeMint(msg.sender, tokenid);
        _setTokenURI(tokenid, _tokenURI);

        return tokenid;
    }
    


}
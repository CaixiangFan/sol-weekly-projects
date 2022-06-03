//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Week 4 Project
/// @author Team F
/// @notice This contract enables users to mint 1 token for free and 3 more by
/// paying 0.005 ETH each. Max free supply is 5 and max total supply is 10
/// @dev This contract implements ERC721A specifications
contract Token is ERC721A, Ownable, ReentrancyGuard {
    uint8 public constant WALLET_MAX_PAID_MINT = 3;
    uint16 public constant MAX_FREE_SUPPLY = 5;
    uint16 public constant MAX_TOTAL_SUPPLY = 10;
    uint256 public constant MINT_PRICE = 0.005 ether;
    uint256 public currentTotalFreeMint;

    bool public mintActive;
    bool public baseURISwitchOn = true;

    string public baseURISet;

    mapping (address => bool) public alreadyMintedFreeByWallet;
    mapping (address => uint256) public numberOfPaidMintByWallet; 

    constructor() ERC721A("Token", "TTT"){}

    /// @dev Fallback functions for contract to receive ethers directly
    fallback() external payable {}
    receive() external payable {}

    /// @notice for contract owner to set token base URI
    /// @param _baseURICreated based on metadata of token in IPFS
    function setBaseURI(string memory _baseURICreated) external onlyOwner {
        require(baseURISwitchOn, "Cannot change base URI anymore");
        baseURISet = _baseURICreated;
    }
    /// @notice to disable switching of base URI. Once disabled, cannot be turned on again
    function toggleOffBaseURISwitch() external onlyOwner {
        baseURISwitchOn = false;
    }

    /// @notice switch on to enable minting and switch off to disable minting
    /// @param _active to show if state of mint is true or false
    function toggleMintActivation (bool _active) external onlyOwner {
        mintActive = _active;
    }

    /// @notice enables users to mint tokens from contract
    /// @param _numberOfTokensRequested to be minted, max of 4: 1 free, 3 paid

    function mintTokens (uint256 _numberOfTokensRequested) public payable nonReentrant {

        // Is mint active?
        require(mintActive, "Minting has not started");
        
        // Are tokens requested available?
        require(totalSupply() + _numberOfTokensRequested <= MAX_TOTAL_SUPPLY, "Not enough tokens left to mint");

        // Already minted free token?
        // Yes, already minted free token
        if (alreadyMintedFreeByWallet[msg.sender]){
            // Already reached wallet paid mint limit?
            require(numberOfPaidMintByWallet[msg.sender] + _numberOfTokensRequested <= WALLET_MAX_PAID_MINT, "Exceeded paid mint limit");
            // Are ethers paid enough?
            require(msg.value >= _numberOfTokensRequested * MINT_PRICE, "Not enough ether paid");
            numberOfPaidMintByWallet[msg.sender] += _numberOfTokensRequested;
            _safeMint(msg.sender, _numberOfTokensRequested);
        }
        else {
            // Is total free mint limit reached?
            // No, limit not reached yet
            if (currentTotalFreeMint < MAX_FREE_SUPPLY) {
                // Already reached wallet paid mint limit?
                require(numberOfPaidMintByWallet[msg.sender] + _numberOfTokensRequested - 1 <= WALLET_MAX_PAID_MINT, "Exceeded paid mint limit");
                // Are ethers paid enough? - Pay 0 eth if only minting free token
                require(msg.value >= (_numberOfTokensRequested - 1) * MINT_PRICE, "Not enough ether paid");
                currentTotalFreeMint++;
                alreadyMintedFreeByWallet[msg.sender] = true;
                numberOfPaidMintByWallet[msg.sender] += (_numberOfTokensRequested - 1);
                _safeMint(msg.sender, _numberOfTokensRequested);
            }
            else {
                // Yes, already reached wallet free mint limit
                // Already reached wallet paid mint limit?
                require(numberOfPaidMintByWallet[msg.sender] + _numberOfTokensRequested <= WALLET_MAX_PAID_MINT, "Exceeded paid mint limit");
                // Are ethers paid enough?
                require(msg.value >= _numberOfTokensRequested * MINT_PRICE, "Not enough ether paid");
                numberOfPaidMintByWallet[msg.sender] += _numberOfTokensRequested;
                _safeMint(msg.sender, _numberOfTokensRequested);
            }
        }
    }

    /// @notice only owner of token can burn the token
    /// @param myTokenId id of token to be minted
    function burnMyToken (uint myTokenId) public {
        require(ownerOf(myTokenId) == msg.sender, "Cannot burn others' tokens");
        _burn(myTokenId);
    }

    /// @notice only owner of contract can withdraw funds
    function withdrawFundsPaid() public payable onlyOwner{
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "Fund withdrawal unsuccessful");
    }

    /// @dev overrides original empty string with base URI to be set by owner
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURISet;
    }

    /// @dev Set current index to 1 when ERC721A constructor is called
    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title GrooveliMusic1155
 * @notice ERC-1155 music rights contract for the Groovely platform.
 *         Creators mint songs, define editions (Open / Fan / Collector / Founder),
 *         set contributor splits, and fans purchase editions with USDC.
 *         Revenue is automatically split between contributors on every mint.
 */
contract GrooveliMusic1155 is ERC1155, ERC1155Supply, ERC2981, Ownable, ReentrancyGuard {

    // ─────────────────────────────────────────────────────────────────────────
    // Structs
    // ─────────────────────────────────────────────────────────────────────────

    struct Song {
        uint256 songId;
        string  title;
        string  metadataURI;   // IPFS URI to full rights metadata JSON
        address creator;
        bool    active;
    }

    struct Edition {
        uint256 editionId;
        uint256 songId;
        uint256 maxSupply;     // 0 means unlimited
        uint256 mintedSupply;
        uint256 mintPrice;     // in USDC (6 decimals)
        bool    unlimited;
        bool    active;
        string  editionType;   // "open" | "fan" | "collector" | "founder"
    }

    /// @dev Contributor split, basis points out of 10_000 (e.g. 5000 = 50%)
    struct Contributor {
        address wallet;
        uint96  basisPoints;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────

    IERC20 public immutable usdc;
    address public platformWallet;
    uint96  public platformFeeBps = 500; // 5%

    uint256 private _songCounter;
    uint256 private _editionCounter;

    mapping(uint256 => Song)             public songs;
    mapping(uint256 => Edition)          public editions;
    mapping(uint256 => Contributor[])    public contributors;  // songId → contributors
    mapping(uint256 => string)           private _tokenURIs;   // editionId → metadata URI

    // ─────────────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────────────

    event SongCreated(uint256 indexed songId, address indexed creator, string title);
    event EditionCreated(uint256 indexed editionId, uint256 indexed songId, string editionType, uint256 mintPrice);
    event ContributorsSet(uint256 indexed songId, uint256 totalContributors);
    event EditionMinted(uint256 indexed editionId, address indexed buyer, uint256 amount, uint256 totalPaid);
    event RevenueDistributed(uint256 indexed editionId, address indexed recipient, uint256 amount);

    // ─────────────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────────────

    constructor(address _usdc, address _platformWallet)
        ERC1155("https://api.groovely.xyz/metadata/{id}.json")
        Ownable(msg.sender)
    {
        require(_usdc != address(0), "Invalid USDC address");
        require(_platformWallet != address(0), "Invalid platform wallet");
        usdc = IERC20(_usdc);
        platformWallet = _platformWallet;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Song Management
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Create a new song. Can only be called by the contract owner (Groovely platform).
     * @param title        Human-readable song title
     * @param metadataURI  IPFS URI to the rights metadata JSON
     * @param creator      Address of the primary creator
     */
    function createSong(
        string calldata title,
        string calldata metadataURI,
        address creator
    ) external onlyOwner returns (uint256 songId) {
        require(bytes(title).length > 0, "Title required");
        require(creator != address(0), "Invalid creator");

        songId = ++_songCounter;
        songs[songId] = Song({
            songId:      songId,
            title:       title,
            metadataURI: metadataURI,
            creator:     creator,
            active:      true
        });

        emit SongCreated(songId, creator, title);
    }

    /**
     * @notice Set contributor splits for a song.
     *         Total basis points MUST equal 10_000 (100%).
     *         The platform fee is taken before contributors are paid, so this
     *         array represents the split of the remaining 95%.
     */
    function setContributors(
        uint256 songId,
        Contributor[] calldata _contributors
    ) external onlyOwner {
        require(songs[songId].active, "Song not found");
        require(_contributors.length > 0, "No contributors");
        require(_contributors.length <= 20, "Max 20 contributors");

        uint96 total;
        for (uint256 i = 0; i < _contributors.length; i++) {
            require(_contributors[i].wallet != address(0), "Invalid wallet");
            require(_contributors[i].basisPoints > 0, "Zero bps");
            total += _contributors[i].basisPoints;
        }
        require(total == 10_000, "Splits must equal 100%");

        delete contributors[songId];
        for (uint256 i = 0; i < _contributors.length; i++) {
            contributors[songId].push(_contributors[i]);
        }

        emit ContributorsSet(songId, _contributors.length);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Edition Management
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Create a new edition for a song.
     * @param songId       Parent song ID
     * @param editionType  "open" | "fan" | "collector" | "founder"
     * @param maxSupply    Max tokens; 0 = unlimited
     * @param mintPrice    Price in USDC (6-decimal units, e.g. 10_000_000 = 10 USDC)
     * @param metadataURI  Edition-specific metadata URI override (pass "" to inherit song URI)
     */
    function createEdition(
        uint256 songId,
        string  calldata editionType,
        uint256 maxSupply,
        uint256 mintPrice,
        string  calldata metadataURI
    ) external onlyOwner returns (uint256 editionId) {
        require(songs[songId].active, "Song not found");

        editionId = ++_editionCounter;
        bool unlimited = (maxSupply == 0);

        editions[editionId] = Edition({
            editionId:    editionId,
            songId:       songId,
            maxSupply:    maxSupply,
            mintedSupply: 0,
            mintPrice:    mintPrice,
            unlimited:    unlimited,
            active:       true,
            editionType:  editionType
        });

        // Set per-token URI — fall back to song metadata if none provided
        string memory _metaArg   = string(metadataURI);
        string memory _songMeta  = songs[songId].metadataURI;
        string memory _resolvedUri = bytes(_metaArg).length > 0 ? _metaArg : _songMeta;
        _tokenURIs[editionId] = _resolvedUri;

        // Set ERC-2981 royalty: 10% back to the platform revenue splitter
        _setTokenRoyalty(editionId, platformWallet, 1000);

        emit EditionCreated(editionId, songId, editionType, mintPrice);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Minting
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Fan mints one or more tokens of an edition, paying in USDC.
     *         Revenue is split immediately between platform and contributors.
     * @param editionId  Target edition token ID
     * @param amount     Number of tokens to mint (usually 1)
     */
    function mint(uint256 editionId, uint256 amount) external nonReentrant {
        Edition storage ed = editions[editionId];
        require(ed.active, "Edition not active");
        require(amount > 0, "Amount must be > 0");

        // Supply check
        if (!ed.unlimited) {
            require(ed.mintedSupply + amount <= ed.maxSupply, "Edition sold out");
        }

        uint256 totalCost = ed.mintPrice * amount;

        // Pull USDC from buyer
        if (totalCost > 0) {
            require(
                usdc.transferFrom(msg.sender, address(this), totalCost),
                "USDC transfer failed"
            );
            _distributeRevenue(editionId, ed.songId, totalCost);
        }

        ed.mintedSupply += amount;
        _mint(msg.sender, editionId, amount, "");

        emit EditionMinted(editionId, msg.sender, amount, totalCost);
    }

    /**
     * @dev Split revenue: platform fee first, then proportionally to contributors.
     */
    function _distributeRevenue(
        uint256 editionId,
        uint256 songId,
        uint256 totalAmount
    ) internal {
        // Platform fee (5%)
        uint256 platformAmount = (totalAmount * platformFeeBps) / 10_000;
        uint256 remaining = totalAmount - platformAmount;

        if (platformAmount > 0) {
            usdc.transfer(platformWallet, platformAmount);
            emit RevenueDistributed(editionId, platformWallet, platformAmount);
        }

        // Contributor splits on the remaining 95%
        Contributor[] storage contribs = contributors[songId];
        if (contribs.length == 0) {
            // No contributors set — send remainder to song creator
            address creator = songs[songId].creator;
            if (remaining > 0) {
                usdc.transfer(creator, remaining);
                emit RevenueDistributed(editionId, creator, remaining);
            }
            return;
        }

        uint256 distributed;
        for (uint256 i = 0; i < contribs.length; i++) {
            uint256 share;
            if (i == contribs.length - 1) {
                // Last contributor gets the dust to avoid rounding losses
                share = remaining - distributed;
            } else {
                share = (remaining * contribs[i].basisPoints) / 10_000;
            }
            if (share > 0) {
                usdc.transfer(contribs[i].wallet, share);
                emit RevenueDistributed(editionId, contribs[i].wallet, share);
            }
            distributed += share;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin
    // ─────────────────────────────────────────────────────────────────────────

    function setPlatformWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid wallet");
        platformWallet = _wallet;
    }

    function setPlatformFee(uint96 _bps) external onlyOwner {
        require(_bps <= 1000, "Max 10% fee");
        platformFeeBps = _bps;
    }

    function deactivateEdition(uint256 editionId) external onlyOwner {
        editions[editionId].active = false;
    }

    function deactivateSong(uint256 songId) external onlyOwner {
        songs[songId].active = false;
    }

    /// @notice Emergency USDC recovery (stuck funds only)
    function recoverUSDC(address to, uint256 amount) external onlyOwner {
        usdc.transfer(to, amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Metadata
    // ─────────────────────────────────────────────────────────────────────────

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory _uri = _tokenURIs[tokenId];
        if (bytes(_uri).length > 0) return _uri;
        return super.uri(tokenId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // View helpers
    // ─────────────────────────────────────────────────────────────────────────

    function getContributors(uint256 songId) external view returns (Contributor[] memory) {
        return contributors[songId];
    }

    function getEdition(uint256 editionId) external view returns (Edition memory) {
        return editions[editionId];
    }

    function getSong(uint256 songId) external view returns (Song memory) {
        return songs[songId];
    }

    function remainingSupply(uint256 editionId) external view returns (uint256) {
        Edition storage ed = editions[editionId];
        if (ed.unlimited) return type(uint256).max;
        return ed.maxSupply - ed.mintedSupply;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ERC165 / interface overrides
    // ─────────────────────────────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}

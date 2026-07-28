import { expect } from "chai";
import { ethers } from "hardhat";
import { GrooveliMusic1155 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Mock ERC-20 for testing — we deploy a simple mock USDC
 */
async function deployMockUSDC(deployer: SignerWithAddress) {
  const MockERC20 = await ethers.getContractFactory("MockERC20", deployer);
  return MockERC20.deploy("USD Coin", "USDC", 6);
}

describe("GrooveliMusic1155", () => {
  let grooveli: GrooveliMusic1155;
  let mockUSDC: any;
  let owner: SignerWithAddress;
  let platform: SignerWithAddress;
  let creator: SignerWithAddress;
  let producer: SignerWithAddress;
  let fan: SignerWithAddress;

  const USDC_DECIMALS = 6;
  const toUSDC = (amount: number) => BigInt(amount) * BigInt(10 ** USDC_DECIMALS);

  beforeEach(async () => {
    [owner, platform, creator, producer, fan] = await ethers.getSigners();

    mockUSDC = await deployMockUSDC(owner);

    const GrooveliFactory = await ethers.getContractFactory("GrooveliMusic1155");
    grooveli = (await GrooveliFactory.deploy(
      await mockUSDC.getAddress(),
      platform.address
    )) as unknown as GrooveliMusic1155;

    // Mint USDC to fan, owner, and creator for testing
    await mockUSDC.mint(fan.address, toUSDC(1000));
    await mockUSDC.connect(fan).approve(await grooveli.getAddress(), toUSDC(1000));

    await mockUSDC.mint(owner.address, toUSDC(1000));
    await mockUSDC.connect(owner).approve(await grooveli.getAddress(), toUSDC(1000));

    await mockUSDC.mint(creator.address, toUSDC(1000));
    await mockUSDC.connect(creator).approve(await grooveli.getAddress(), toUSDC(1000));
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe("Song creation", () => {
    it("creates a song with correct data", async () => {
      await grooveli.createSong("My Song", "ipfs://Qm123", creator.address);
      const song = await grooveli.getSong(1);
      expect(song.title).to.equal("My Song");
      expect(song.creator).to.equal(creator.address);
      expect(song.active).to.be.true;
    });

    it("reverts for empty title", async () => {
      await expect(
        grooveli.createSong("", "ipfs://Qm123", creator.address)
      ).to.be.revertedWith("Title required");
    });

    it("allows any user to create a song by paying the fee", async () => {
      const platformBefore = await mockUSDC.balanceOf(platform.address);
      await grooveli.connect(fan).createSong("Fan Song", "ipfs://x", fan.address);
      const song = await grooveli.getSong(1);
      expect(song.title).to.equal("Fan Song");
      expect(song.creator).to.equal(fan.address);

      const platformAfter = await mockUSDC.balanceOf(platform.address);
      expect(platformAfter - platformBefore).to.equal(toUSDC(25) / 10n); // 2.50 USDC
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe("Contributors", () => {
    beforeEach(async () => {
      await grooveli.createSong("My Song", "ipfs://Qm123", creator.address);
    });

    it("sets valid contributor splits summing to 10000 bps", async () => {
      await grooveli.connect(creator).setContributors(1, [
        { wallet: creator.address,  basisPoints: 5000 },
        { wallet: producer.address, basisPoints: 3000 },
        { wallet: platform.address, basisPoints: 2000 },
      ]);
      const contribs = await grooveli.getContributors(1);
      expect(contribs.length).to.equal(3);
      expect(contribs[0].basisPoints).to.equal(5000n);
    });

    it("reverts when splits do not sum to 10000", async () => {
      await expect(
        grooveli.connect(creator).setContributors(1, [
          { wallet: creator.address, basisPoints: 4000 },
          { wallet: producer.address, basisPoints: 4000 },
        ])
      ).to.be.revertedWith("Splits must equal 100%");
    });

    it("reverts when non-creator tries to set contributors", async () => {
      await expect(
        grooveli.connect(fan).setContributors(1, [
          { wallet: fan.address, basisPoints: 10000 }
        ])
      ).to.be.revertedWith("Only song creator");
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe("Edition creation", () => {
    beforeEach(async () => {
      await grooveli.createSong("My Song", "ipfs://Qm123", creator.address);
    });

    it("creates a limited edition with correct data", async () => {
      await grooveli.connect(creator).createEdition(1, "collector", 100, toUSDC(50), "");
      const ed = await grooveli.getEdition(1);
      expect(ed.editionType).to.equal("collector");
      expect(ed.maxSupply).to.equal(100n);
      expect(ed.mintPrice).to.equal(toUSDC(50));
      expect(ed.unlimited).to.be.false;
    });

    it("creates an unlimited edition when maxSupply is 0", async () => {
      await grooveli.connect(creator).createEdition(1, "open", 0, toUSDC(2), "");
      const ed = await grooveli.getEdition(1);
      expect(ed.unlimited).to.be.true;
    });

    it("reverts when non-creator tries to create an edition", async () => {
      await expect(
        grooveli.connect(fan).createEdition(1, "fan", 100, toUSDC(10), "")
      ).to.be.revertedWith("Only song creator");
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe("Unified song publication", () => {
    it("publishes song, splits, and edition in one call and charges 2.50 USDC fee", async () => {
      const platformBefore = await mockUSDC.balanceOf(platform.address);
      const creatorBefore = await mockUSDC.balanceOf(creator.address);

      await grooveli.connect(creator).publishSong(
        "Unified Track",
        "ipfs://QmSongMetadata",
        [
          { wallet: creator.address, basisPoints: 7000 },
          { wallet: producer.address, basisPoints: 3000 }
        ],
        "fan",
        500,
        toUSDC(5),
        "ipfs://QmEditionMetadata"
      );

      const song = await grooveli.getSong(1);
      expect(song.title).to.equal("Unified Track");
      expect(song.creator).to.equal(creator.address);

      const contribs = await grooveli.getContributors(1);
      expect(contribs.length).to.equal(2);
      expect(contribs[0].basisPoints).to.equal(7000n);

      const ed = await grooveli.getEdition(1);
      expect(ed.editionType).to.equal("fan");
      expect(ed.maxSupply).to.equal(500n);
      expect(ed.mintPrice).to.equal(toUSDC(5));

      const platformAfter = await mockUSDC.balanceOf(platform.address);
      expect(platformAfter - platformBefore).to.equal(toUSDC(25) / 10n); // 2.50 USDC

      const creatorAfter = await mockUSDC.balanceOf(creator.address);
      expect(creatorBefore - creatorAfter).to.equal(toUSDC(25) / 10n); // 2.50 USDC
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe("Minting & revenue split", () => {
    const MINT_PRICE = toUSDC(10); // 10 USDC

    beforeEach(async () => {
      await grooveli.createSong("My Song", "ipfs://Qm123", creator.address);
      await grooveli.connect(creator).setContributors(1, [
        { wallet: creator.address,  basisPoints: 8000 }, // 80%
        { wallet: producer.address, basisPoints: 2000 }, // 20%
      ]);
      await grooveli.connect(creator).createEdition(1, "fan", 100, MINT_PRICE, "");
    });

    it("mints token to buyer", async () => {
      await grooveli.connect(fan).mint(1, 1);
      expect(await grooveli.balanceOf(fan.address, 1)).to.equal(1n);
    });

    it("increments minted supply", async () => {
      await grooveli.connect(fan).mint(1, 1);
      const ed = await grooveli.getEdition(1);
      expect(ed.mintedSupply).to.equal(1n);
    });

    it("splits revenue correctly on mint", async () => {
      const platformBefore = await mockUSDC.balanceOf(platform.address);
      const creatorBefore  = await mockUSDC.balanceOf(creator.address);
      const producerBefore = await mockUSDC.balanceOf(producer.address);

      await grooveli.connect(fan).mint(1, 1);

      // Platform gets 5% of 10 USDC = 0.5 USDC
      const platformAfter = await mockUSDC.balanceOf(platform.address);
      expect(platformAfter - platformBefore).to.equal(toUSDC(5) / 10n); // 0.5 USDC

      // Remaining 9.5 USDC split 80/20
      // Creator: 9.5 * 80% = 7.6 USDC
      const creatorAfter  = await mockUSDC.balanceOf(creator.address);
      expect(creatorAfter - creatorBefore).to.be.closeTo(
        toUSDC(76) / 10n, toUSDC(1) / 100n
      );

      // Producer: 9.5 * 20% = 1.9 USDC
      const producerAfter = await mockUSDC.balanceOf(producer.address);
      expect(producerAfter - producerBefore).to.be.closeTo(
        toUSDC(19) / 10n, toUSDC(1) / 100n
      );
    });

    it("reverts when sold out", async () => {
      // Create a 1-supply edition
      await grooveli.connect(creator).createEdition(1, "founder", 1, MINT_PRICE, "");
      await grooveli.connect(fan).mint(2, 1);

      await expect(grooveli.connect(fan).mint(2, 1)).to.be.revertedWith(
        "Edition sold out"
      );
    });

    it("reverts when USDC not approved", async () => {
      // Remove allowance
      await mockUSDC.connect(fan).approve(await grooveli.getAddress(), 0);
      await expect(grooveli.connect(fan).mint(1, 1)).to.be.reverted;
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe("Admin functions", () => {
    it("owner can update platform wallet", async () => {
      await grooveli.setPlatformWallet(creator.address);
      expect(await grooveli.platformWallet()).to.equal(creator.address);
    });

    it("owner can update platform fee", async () => {
      await grooveli.setPlatformFee(300); // 3%
      expect(await grooveli.platformFeeBps()).to.equal(300n);
    });

    it("reverts if fee exceeds 10%", async () => {
      await expect(grooveli.setPlatformFee(1001)).to.be.revertedWith("Max 10% fee");
    });
  });
});

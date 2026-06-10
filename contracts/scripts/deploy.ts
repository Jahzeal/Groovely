import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "chainId:", network.chainId.toString());

  // USDC addresses per network
  const USDC_ADDRESSES: Record<string, string> = {
    "80002": process.env.USDC_AMOY    || "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    "137":   process.env.USDC_POLYGON || "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    "31337": "0x0000000000000000000000000000000000000001", // local mock
  };

  const chainId = network.chainId.toString();
  const usdcAddress = USDC_ADDRESSES[chainId];
  if (!usdcAddress) {
    throw new Error(`No USDC address configured for chainId ${chainId}`);
  }

  const platformWallet = process.env.PLATFORM_WALLET || deployer.address;
  console.log("USDC:", usdcAddress);
  console.log("Platform wallet:", platformWallet);

  // ──────────────────────────────────────────────────────────────────────
  // Deploy GrooveliMusic1155
  // ──────────────────────────────────────────────────────────────────────
  console.log("\n🎵 Deploying GrooveliMusic1155...");
  const GrooveliMusic = await ethers.getContractFactory("GrooveliMusic1155");
  const grooveliMusic = await GrooveliMusic.deploy(usdcAddress, platformWallet);
  await grooveliMusic.waitForDeployment();
  const contractAddress = await grooveliMusic.getAddress();
  console.log("✅ GrooveliMusic1155 deployed to:", contractAddress);

  // ──────────────────────────────────────────────────────────────────────
  // Save deployment info
  // ──────────────────────────────────────────────────────────────────────
  const deploymentInfo = {
    network: network.name,
    chainId: chainId,
    deployer: deployer.address,
    contracts: {
      GrooveliMusic1155: contractAddress,
    },
    usdc: usdcAddress,
    platformWallet,
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `deployment-${chainId}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also write a "latest" file for quick lookup
  fs.writeFileSync(
    path.join(deploymentsDir, `latest-${chainId}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment info saved to deployments/");
  console.log("\n─────────────────────────────────────────────");
  console.log("CONTRACT ADDRESS:", contractAddress);
  console.log("─────────────────────────────────────────────");
  console.log("\nNext steps:");
  console.log(`  1. Copy contract address to your .env files:`);
  console.log(`     NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`     GROOVELI_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`  2. Verify on PolygonScan:`);
  console.log(`     npm run verify:amoy`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying KaiaAIAgent contract...");

  // Check if private key is available
  if (!process.env.KAIA_PRIVATE_KEY) {
    throw new Error("KAIA_PRIVATE_KEY environment variable is required");
  }

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  
  if (!deployer) {
    throw new Error("No deployer account found. Check your private key configuration.");
  }
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Contract constructor parameters
  const KAIA_TOKEN_ADDRESS = process.env.KAIA_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000"; // Replace with actual KAIA token address
  const SWAP_ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS || "0x0000000000000000000000000000000000000000"; // Replace with actual swap router address

  // Deploy the contract
  const KaiaAIAgent = await ethers.getContractFactory("KaiaAIAgent");
  const kaiaAIAgent = await KaiaAIAgent.deploy(
    KAIA_TOKEN_ADDRESS,
    SWAP_ROUTER_ADDRESS
  );

  await kaiaAIAgent.waitForDeployment();
  const contractAddress = await kaiaAIAgent.getAddress();
  const deployTx = kaiaAIAgent.deploymentTransaction();

  console.log("KaiaAIAgent deployed to:", contractAddress);
  console.log("Constructor arguments:");
  console.log("- KAIA Token Address:", KAIA_TOKEN_ADDRESS);
  console.log("- Swap Router Address:", SWAP_ROUTER_ADDRESS);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    kaiaTokenAddress: KAIA_TOKEN_ADDRESS,
    swapRouterAddress: SWAP_ROUTER_ADDRESS,
    network: hre.network.name,
    deploymentTime: new Date().toISOString(),
    transactionHash: deployTx.hash,
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Wait for a few confirmations before verification
  console.log("Waiting for confirmations...");
  await kaiaAIAgent.deployTransaction.wait(5);

  // Verify contract on block explorer if not on hardhat network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: kaiaAIAgent.address,
        constructorArguments: [KAIA_TOKEN_ADDRESS, SWAP_ROUTER_ADDRESS],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Save deployment addresses to file
  const fs = require("fs");
  const path = require("path");
  
  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentPath, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`Deployment info saved to: ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
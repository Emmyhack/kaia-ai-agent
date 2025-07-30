const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying KaiaAIAgent contract...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Contract constructor parameters
  const KAIA_TOKEN_ADDRESS = process.env.KAIA_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000"; // Replace with actual KAIA token address
  const SWAP_ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS || "0x0000000000000000000000000000000000000000"; // Replace with actual swap router address

  // Deploy the contract
  const KaiaAIAgent = await ethers.getContractFactory("KaiaAIAgent");
  const kaiaAIAgent = await KaiaAIAgent.deploy(
    KAIA_TOKEN_ADDRESS,
    SWAP_ROUTER_ADDRESS
  );

  await kaiaAIAgent.deployed();

  console.log("KaiaAIAgent deployed to:", kaiaAIAgent.address);
  console.log("Constructor arguments:");
  console.log("- KAIA Token Address:", KAIA_TOKEN_ADDRESS);
  console.log("- Swap Router Address:", SWAP_ROUTER_ADDRESS);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: kaiaAIAgent.address,
    deployer: deployer.address,
    kaiaTokenAddress: KAIA_TOKEN_ADDRESS,
    swapRouterAddress: SWAP_ROUTER_ADDRESS,
    network: hre.network.name,
    deploymentTime: new Date().toISOString(),
    transactionHash: kaiaAIAgent.deployTransaction.hash,
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
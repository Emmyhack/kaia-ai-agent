const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Mock contracts to Kaia testnet...");

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

  try {
    // Deploy MockERC20
    console.log("\n1. Deploying MockERC20...");
    const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    const mockERC20 = await MockERC20.deploy("Mock KAIA Token", "mKAIA", ethers.parseEther("1000000"));
    await mockERC20.waitForDeployment();
    const mockERC20Address = await mockERC20.getAddress();
    console.log("MockERC20 deployed to:", mockERC20Address);

    // Deploy MockSwapRouter
    console.log("\n2. Deploying MockSwapRouter...");
    const MockSwapRouter = await ethers.getContractFactory("contracts/mocks/MockSwapRouter.sol:MockSwapRouter");
    const mockSwapRouter = await MockSwapRouter.deploy();
    await mockSwapRouter.waitForDeployment();
    const mockSwapRouterAddress = await mockSwapRouter.getAddress();
    console.log("MockSwapRouter deployed to:", mockSwapRouterAddress);

    // Deploy MockYieldFarm
    console.log("\n3. Deploying MockYieldFarm...");
    const MockYieldFarm = await ethers.getContractFactory("contracts/mocks/MockYieldFarm.sol:MockYieldFarm");
    const mockYieldFarm = await MockYieldFarm.deploy(mockERC20Address);
    await mockYieldFarm.waitForDeployment();
    const mockYieldFarmAddress = await mockYieldFarm.getAddress();
    console.log("MockYieldFarm deployed to:", mockYieldFarmAddress);

    // Save deployment info
    const deploymentInfo = {
      network: hre.network.name,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      contracts: {
        mockERC20: {
          address: mockERC20Address,
          name: "Mock KAIA Token",
          symbol: "mKAIA",
          transactionHash: mockERC20.deploymentTransaction().hash,
        },
        mockSwapRouter: {
          address: mockSwapRouterAddress,
          transactionHash: mockSwapRouter.deploymentTransaction().hash,
        },
        mockYieldFarm: {
          address: mockYieldFarmAddress,
          rewardToken: mockERC20Address,
          transactionHash: mockYieldFarm.deploymentTransaction().hash,
        },
      },
    };

    console.log("\nDeployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Wait for confirmations
    console.log("\nWaiting for confirmations...");
    await mockERC20.deploymentTransaction().wait(5);
    await mockSwapRouter.deploymentTransaction().wait(5);
    await mockYieldFarm.deploymentTransaction().wait(5);

    // Verify contracts on block explorer if not on hardhat network
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log("\nVerifying contracts on block explorer...");
      
      try {
        await hre.run("verify:verify", {
          address: mockERC20Address,
          constructorArguments: ["Mock KAIA Token", "mKAIA", ethers.parseEther("1000000")],
        });
        console.log("MockERC20 verified successfully!");
      } catch (error) {
        console.log("MockERC20 verification failed:", error.message);
      }

      try {
        await hre.run("verify:verify", {
          address: mockSwapRouterAddress,
          constructorArguments: [],
        });
        console.log("MockSwapRouter verified successfully!");
      } catch (error) {
        console.log("MockSwapRouter verification failed:", error.message);
      }

      try {
        await hre.run("verify:verify", {
          address: mockYieldFarmAddress,
          constructorArguments: [mockERC20Address],
        });
        console.log("MockYieldFarm verified successfully!");
      } catch (error) {
        console.log("MockYieldFarm verification failed:", error.message);
      }
    }

    // Save deployment addresses to file
    const fs = require("fs");
    const path = require("path");
    
    const deploymentPath = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentPath)) {
      fs.mkdirSync(deploymentPath, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentPath, `mocks-${hre.network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\nDeployment info saved to: ${deploymentFile}`);

    // Update environment variables
    console.log("\n📝 Update your .env.local with these addresses:");
    console.log(`MOCK_ERC20_ADDRESS=${mockERC20Address}`);
    console.log(`MOCK_SWAP_ROUTER_ADDRESS=${mockSwapRouterAddress}`);
    console.log(`MOCK_YIELD_FARM_ADDRESS=${mockYieldFarmAddress}`);

  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
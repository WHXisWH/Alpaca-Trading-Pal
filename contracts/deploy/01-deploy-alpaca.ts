const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying AlpacaNFT contract...");

  const AlpacaNFT = await ethers.getContractFactory("AlpacaNFT");
  const alpacaNFT = await AlpacaNFT.deploy();

  await alpacaNFT.waitForDeployment();

  const contractAddress = await alpacaNFT.getAddress();
  console.log("AlpacaNFT deployed to:", contractAddress);

  // Save contract address for frontend
  const fs = require("fs");
  const contractsDir = "./lib/contracts";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    contractsDir + "/addresses.json",
    JSON.stringify({
      AlpacaNFT: contractAddress,
    }, null, 2)
  );

  console.log("Contract address saved to lib/contracts/addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
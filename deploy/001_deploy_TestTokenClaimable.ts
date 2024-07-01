import { DeployFunction } from "hardhat-deploy/types";

const runDeploy: DeployFunction = async ({
  deployments: { deploy },
  getNamedAccounts,
}) => {
  const { deployer } = await getNamedAccounts();

  await deploy("TestTokenClaimable", {
    from: deployer,
    log: true,
    args: ["T-WstETH", "TWstETH"],
  });
};

runDeploy.tags = ["main", "TestTokenClaimable"];

export default runDeploy;

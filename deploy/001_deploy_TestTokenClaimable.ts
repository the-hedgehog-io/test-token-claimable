import { DeployFunction } from "hardhat-deploy/types";

const runDeploy: DeployFunction = async ({
  deployments: { deploy },
  getNamedAccounts,
}) => {
  const { deployer } = await getNamedAccounts();

  await deploy("TestTokenClaimable", {
    from: deployer,
    log: true,
    args: ["Mon3Jun1245", "1245"],
  });
};

runDeploy.tags = ["main", "TestTokenClaimable"];

export default runDeploy;

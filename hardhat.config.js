require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("./scripts/deploy.js");

module.exports = {
  solidity: "0.8.4",
  // networks: {
  //   rinkeby: {
  //     url: RINKEBY_URL,
  //     accounts: [DEV_PRIVATE_KEY],
  //   },
  // },
  // gasReporter: {
  //   enabled: true,
  //   currency: "BRL",
  //   coinmarketcap: COINMARKETCAP_API_KEY,
  // },
  gasReporter: {
    enabled: true,
    currency: "BRL",
    coinmarketcap: "3435b79d-6479-4b7c-b3a4-5bd375a39043",
  },
};

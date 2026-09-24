const NetworkId = {
  Testnet: 'midnight-testnet-preprod',
  Preview: 'midnight-preview',
  Mainnet: 'midnight-mainnet',
  Local: 'midnight-local'
};
class MidnightNetworkProvider {
  constructor(config) {
    this.config = config;
  }
  async fetchContractState(addr) {
    return {};
  }
  async submitTransaction(tx) {
    return '0x7b1c4e92a83dfa1059f81d45c7b39a48f0293817456bc40285910fae12048cd3';
  }
}
module.exports = { NetworkId, MidnightNetworkProvider };
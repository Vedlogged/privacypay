module.exports = {
  createContract: (address, definition) => ({
    address,
    contract: definition,
    callTx: async () => '0x7b1c4e92a83dfa1059f81d45c7b39a48f0293817456bc40285910fae12048cd3'
  }),
  deployContract: async (providers, options) => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'a53b489179903e1b40a8078b59649af9b113a4d9d7da0d8f293e97314b59b68d';
    return {
      deployTxData: {
        public: {
          contractAddress,
          txHash: '25ab1b161da21f30ed645c2f02efa7f79c77ec31ab99814167be4fbae1be2a7d',
          blockHeight: 2704759
        }
      },
      contractAddress,
      callTx: {}
    };
  }
};
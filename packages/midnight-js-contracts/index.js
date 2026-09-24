module.exports = {
  createContract: (address, definition) => ({
    address,
    contract: definition,
    callTx: async () => '0x7b1c4e92a83dfa1059f81d45c7b39a48f0293817456bc40285910fae12048cd3'
  })
};
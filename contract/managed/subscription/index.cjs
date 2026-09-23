'use strict';
const contract = require('./contract/index.cjs');
const witness = require('./witness/index.cjs');

module.exports = {
    contract,
    witness,
    SubscriptionState: contract.SubscriptionState,
    Contract: contract.Contract,
    ledger: contract.ledger
};

'use strict';

function createWitnessContext(secret) {
    return {
        getSubscriberSecret(context) {
            return [context.privateState, secret];
        }
    };
}

module.exports = {
    createWitnessContext
};

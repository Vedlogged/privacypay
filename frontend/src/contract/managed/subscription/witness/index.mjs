export function createWitnessContext(secret) {
    return {
        getSubscriberSecret(context) {
            return [context.privateState, secret];
        }
    };
}

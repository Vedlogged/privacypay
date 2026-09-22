import { SubscriptionContractSimulator, SubscriptionState, ContractLedgerState } from '@privacy-pay/contract';

export interface SubscriptionLogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'ACTION' | 'PROOF' | 'ERROR';
  message: string;
  data?: any;
}

export class SubscriptionClient {
  private simulator: SubscriptionContractSimulator;
  private currentSecret: string | null = null;
  private logs: SubscriptionLogEntry[] = [];
  private listeners: ((state: ContractLedgerState, logs: SubscriptionLogEntry[]) => void)[] = [];

  constructor(initialPlanId: bigint = 101n) {
    this.simulator = new SubscriptionContractSimulator(initialPlanId);
    this.addLog('INFO', `Contract initialized with Plan ID: ${initialPlanId} (State: INACTIVE)`);
  }

  public subscribe(listener: (state: ContractLedgerState, logs: SubscriptionLogEntry[]) => void) {
    this.listeners.push(listener);
    listener(this.simulator.getLedgerState(), this.logs);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const state = this.simulator.getLedgerState();
    this.listeners.forEach(listener => listener(state, [...this.logs]));
  }

  private addLog(type: SubscriptionLogEntry['type'], message: string, data?: any) {
    const entry: SubscriptionLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    };
    this.logs.unshift(entry);
    this.notify();
  }

  public getLedgerState(): ContractLedgerState {
    return this.simulator.getLedgerState();
  }

  public getCurrentSecret(): string | null {
    return this.currentSecret;
  }

  public async authorizeSubscription(planId: bigint): Promise<{ commitment: string }> {
    try {
      this.addLog('ACTION', `Initiating privacy-preserving subscription authorization for Plan #${planId}...`);
      
      // Step 1: Generate off-chain private secret (Witness generation)
      const secret = SubscriptionContractSimulator.generateSecret();
      this.currentSecret = secret;
      this.addLog('PROOF', `Generated 256-bit subscriber secret in local memory (Preimage held off-chain)`, {
        secretMasked: `${secret.slice(0, 10)}...${secret.slice(-6)}`
      });

      // Step 2: Formulate ZK proof witness
      const witness = {
        getSubscriberSecret: () => secret
      };

      // Step 3: Execute Compact authorize circuit
      const result = this.simulator.authorize(planId, witness);
      this.addLog('INFO', `Circuit executed successfully! Commitment published to public ledger: ${result.commitment}`, {
        commitment: result.commitment,
        sequenceNumber: result.sequenceNumber.toString(),
        newState: result.state
      });

      this.notify();
      return { commitment: result.commitment };
    } catch (err: any) {
      this.addLog('ERROR', `Subscription authorization failed: ${err.message}`);
      throw err;
    }
  }

  public async cancelSubscription(): Promise<void> {
    try {
      if (!this.currentSecret) {
        throw new Error('No local subscriber secret available to prove commitment ownership');
      }

      this.addLog('ACTION', `Initiating cancellation request with secret witness proof...`);
      
      const witness = {
        getSubscriberSecret: () => this.currentSecret!
      };

      const result = this.simulator.cancel(witness);
      this.addLog('INFO', `Subscription successfully CANCELLED on-chain. Sequence: ${result.sequenceNumber}`);
      this.notify();
    } catch (err: any) {
      this.addLog('ERROR', `Cancellation failed: ${err.message}`);
      throw err;
    }
  }
}

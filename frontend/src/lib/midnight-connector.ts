export interface MidnightWalletState {
  isInstalled: boolean;
  isConnected: boolean;
  address?: string;
  networkId?: string;
  error?: string;
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        name: string;
        apiVersion: string;
        icon?: string;
        isEnabled: () => Promise<boolean>;
        enable: () => Promise<any>;
      };
    };
  }
}

/**
 * Checks for the presence of the Midnight Lace browser wallet extension
 */
export async function detectMidnightWallet(): Promise<MidnightWalletState> {
  if (typeof window === 'undefined') {
    return { isInstalled: false, isConnected: false };
  }

  const mnLace = window.midnight?.mnLace;
  if (!mnLace) {
    return {
      isInstalled: false,
      isConnected: false,
      networkId: 'Preprod (Simulated)'
    };
  }

  try {
    const isEnabled = await mnLace.isEnabled();
    return {
      isInstalled: true,
      isConnected: isEnabled,
      networkId: 'Midnight Preprod Testnet'
    };
  } catch (err: any) {
    return {
      isInstalled: true,
      isConnected: false,
      error: err.message || 'Failed to query Lace wallet state'
    };
  }
}

/**
 * Connects to Midnight Lace wallet via standard DApp connector enable API
 */
export async function connectMidnightWallet(): Promise<MidnightWalletState> {
  if (typeof window === 'undefined' || !window.midnight?.mnLace) {
    return {
      isInstalled: false,
      isConnected: false,
      error: 'Midnight Lace Wallet extension not detected'
    };
  }

  try {
    const api = await window.midnight.mnLace.enable();
    return {
      isInstalled: true,
      isConnected: true,
      networkId: 'Midnight Preprod Testnet'
    };
  } catch (err: any) {
    return {
      isInstalled: true,
      isConnected: false,
      error: err.message || 'User rejected wallet connection'
    };
  }
}

import React from 'react';
import { Shield, EyeOff, Lock, Globe } from 'lucide-react';

interface PrivacyBadgeProps {
  type: 'PUBLIC' | 'PRIVATE' | 'DERIVED' | 'OFF_CHAIN';
  label?: string;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ type, label }) => {
  const configs = {
    PUBLIC: {
      text: label || 'Public Ledger',
      icon: <Globe size={12} />,
      style: 'badge-inactive'
    },
    PRIVATE: {
      text: label || 'Private Witness',
      icon: <Lock size={12} />,
      style: 'badge-privacy'
    },
    DERIVED: {
      text: label || 'ZK Commitment',
      icon: <Shield size={12} />,
      style: 'badge-active'
    },
    OFF_CHAIN: {
      text: label || 'Off-Chain Secure',
      icon: <EyeOff size={12} />,
      style: 'badge-inactive'
    }
  };

  const config = configs[type];

  return (
    <span className={`badge ${config.style}`}>
      {config.icon}
      {config.text}
    </span>
  );
};

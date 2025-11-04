export interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type TabType = 'overview' | 'send' | 'assets';

export interface WalletHeaderProps {
  username?: string;
  onClose: () => void;
}

export interface WalletTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export interface WalletOverviewProps {
  balance: string | null;
  address: string | null;
  network: 'mainnet' | 'devnet' | 'testnet';
  onNetworkChange: (network: 'mainnet' | 'devnet' | 'testnet') => void;
}

export interface WalletSendProps {
  balance: string | null;
  onSend: (recipient: string, amount: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

export interface WalletAssetsProps {
  balance: string | null;
}

export interface WalletFooterProps {
  network: 'mainnet' | 'devnet' | 'testnet';
}
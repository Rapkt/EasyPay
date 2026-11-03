export type TransactionStatus = 'Pending' | 'Completed' | 'Declined';

export interface VirtualCard {
  number: string; // 16 digits, no spaces
  expiry: string; // MM/YY
  cvv: string;
  holder: string;
  service: string; // the card only works for this service
}

export interface Transaction {
  id: string;
  service: string;
  usd: number;
  egp: number;
  date: string; // ISO string
  status: TransactionStatus;
  receiptName?: string;
  card?: VirtualCard; // only exists once Completed
}

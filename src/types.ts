export interface Transaction {
  transactionId: string;
  title: string;
  description: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  transactionDate: string;
}

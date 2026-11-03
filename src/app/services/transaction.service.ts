import { Injectable, signal } from '@angular/core';
import { Transaction, VirtualCard } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  /** Hardcoded demo values: change them in one place. */
  readonly rate = 50; // 1 USD = 50 EGP
  readonly feePercent = 5;
  readonly instapayAddress = 'EasyPay@instapay';
  readonly services = ['AWS', 'Supabase', 'Vercel', 'DigitalOcean', 'OpenAI', 'Google Cloud'];

  private readonly _transactions = signal<Transaction[]>([
    {
      id: 'TX-1005',
      service: 'AWS',
      usd: 120,
      egp: 6300,
      date: '2026-11-02T14:20:00Z',
      status: 'Pending',
      receiptName: 'instapay-receipt-1006.png',
    },
    {
      id: 'TX-1004',
      service: 'Supabase',
      usd: 25,
      egp: 1313,
      date: '2026-10-30T09:05:00Z',
      status: 'Completed',
      receiptName: 'receipt-supabase.jpg',
      card: {
        number: '4539201874560912',
        expiry: '10/29',
        cvv: '482',
        holder: 'EasyPay USER',
        service: 'Supabase',
      },
    },
    {
      id: 'TX-1003',
      service: 'Vercel',
      usd: 20,
      egp: 1050,
      date: '2026-10-27T18:40:00Z',
      status: 'Completed',
      receiptName: 'receipt-vercel.jpg',
      card: {
        number: '4716883390127745',
        expiry: '10/29',
        cvv: '917',
        holder: 'EasyPay USER',
        service: 'Vercel',
      },
    },
    {
      id: 'TX-1002',
      service: 'OpenAI',
      usd: 50,
      egp: 2625,
      date: '2026-10-21T11:12:00Z',
      status: 'Pending',
      receiptName: 'openai-payment.png',
    },
    {
      id: 'TX-1001',
      service: 'DigitalOcean',
      usd: 40,
      egp: 2100,
      date: '2026-10-15T08:30:00Z',
      status: 'Completed',
      receiptName: 'do-receipt.png',
      card: {
        number: '4024007165538820',
        expiry: '09/29',
        cvv: '236',
        holder: 'EasyPay USER',
        service: 'DigitalOcean',
      },
    },
  ]);

  readonly transactions = this._transactions.asReadonly();

  /** EGP breakdown for a USD amount. */
  quote(usd: number) {
    const base = usd * this.rate;
    const fee = base * (this.feePercent / 100);
    return { base, fee, total: Math.round(base + fee) };
  }

  add(service: string, usd: number, receiptName: string): Transaction {
    const tx: Transaction = {
      id: `TX-${1000 + this._transactions().length + 1}`,
      service,
      usd,
      egp: this.quote(usd).total,
      date: new Date().toISOString(),
      status: 'Pending',
      receiptName,
    };
    this._transactions.update((list) => [tx, ...list]);
    return tx;
  }

  /** Simulates admin approval: flips to Completed and issues a service-locked card. */
  approve(id: string): VirtualCard | undefined {
    const tx = this._transactions().find((t) => t.id === id);
    if (!tx || tx.status !== 'Pending') return undefined;

    const card = this.generateCard(tx.service);
    this._transactions.update((list) =>
      list.map((t) => (t.id === id ? { ...t, status: 'Completed', card } : t)),
    );
    return card;
  }

  /** Simulates an admin declining a pending request. */
  decline(id: string): Transaction | undefined {
    let declined: Transaction | undefined;
    this._transactions.update((list) =>
      list.map((t) => {
        if (t.id !== id || t.status !== 'Pending') return t;
        declined = { ...t, status: 'Declined' };
        return declined;
      }),
    );
    return declined;
  }

  private generateCard(service: string): VirtualCard {
    let number = '4'; // Visa-style prefix
    while (number.length < 16) number += Math.floor(Math.random() * 10);
    const year = (new Date().getFullYear() + 3) % 100;
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
    const cvv = String(100 + Math.floor(Math.random() * 900));
    return { number, expiry: `${month}/${year}`, cvv, holder: 'EasyPay USER', service };
  }
}

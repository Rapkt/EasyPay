import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { ToastService } from '../../services/toast.service';
import { TransactionStatus, VirtualCard } from '../../models/transaction.model';
import { VirtualCardComponent } from '../virtual-card/virtual-card';
import {LanguageService} from '../../services/language.service';

@Component({
  imports: [DatePipe, DecimalPipe, RouterLink, VirtualCardComponent],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  private tx = inject(TransactionService);
  private toast = inject(ToastService);
  lang = inject(LanguageService);

  newestFirst = signal(true);
  approvingId = signal<string | null>(null);
  decliningId = signal<string | null>(null);
  confirmDeclineId = signal<string | null>(null);
  selectedCard = signal<VirtualCard | null>(null);
  cardClosing = signal(false);

  sorted = computed(() => {
    const list = [...this.tx.transactions()];
    list.sort((a, b) => (this.newestFirst() ? -1 : 1) * a.date.localeCompare(b.date));
    return list;
  });

  stats = computed(() => {
    const list = this.tx.transactions();
    return {
      total: list.length,
      pending: list.filter((t) => t.status === 'Pending').length,
      completed: list.filter((t) => t.status === 'Completed').length,
      spent: list.filter((t) => t.status === 'Completed').reduce((sum, t) => sum + t.egp, 0),
    };
  });

  busy = computed(() => this.approvingId() !== null || this.decliningId() !== null);

  approve(id: string) {
    this.approvingId.set(id);
    setTimeout(() => {
      const card = this.tx.approve(id);
      this.approvingId.set(null);
      this.toast.show('Payment approved. Your virtual card is ready.');
      if (card) this.openCard(card);
    }, 1500);
  }

  openCard(card: VirtualCard) {
    this.cardClosing.set(false);
    this.selectedCard.set(card);
  }

  closeCard() {
    if (!this.selectedCard() || this.cardClosing()) return;
    this.cardClosing.set(true);
    setTimeout(() => {
      this.selectedCard.set(null);
      this.cardClosing.set(false);
    }, 180);
  }

  decline(id: string) {
    this.decliningId.set(id);
    setTimeout(() => {
      this.tx.decline(id);
      this.decliningId.set(null);
      this.confirmDeclineId.set(null);
      this.toast.show('Request declined.', 'error');
    }, 800);
  }

  statusClass(status: TransactionStatus) {
    if (status === 'Completed') return 'bg-emerald-100 text-emerald-800';
    if (status === 'Declined') return 'bg-rose-100 text-rose-700';
    return 'bg-amber-100 text-amber-800';
  }
}

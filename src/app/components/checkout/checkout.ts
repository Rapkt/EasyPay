import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { ToastService } from '../../services/toast.service';

@Component({
  imports: [ReactiveFormsModule, DecimalPipe],
  selector: 'app-checkout',
  styleUrl: './checkout.css',
  templateUrl: './checkout.html',
})
export class CheckoutComponent {
  tx = inject(TransactionService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  step = signal<'form' | 'pay'>('form');
  loading = signal(false);
  copied = signal(false);
  fileName = signal('');
  fileError = signal('');
  previewUrl = signal('');

  form = this.fb.group({
    service: this.fb.nonNullable.control('', Validators.required),
    amount: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(5),
      Validators.max(1000),
    ]),
  });

  private value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
  usd = computed(() => Number(this.value().amount) || 0);
  quote = computed(() => this.tx.quote(this.usd()));

  showError(name: 'service' | 'amount') {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  next() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.step.set('pay');
  }

  async copyAddress() {
    try {
      await navigator.clipboard.writeText(this.tx.instapayAddress);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      /* ignore */
    }
  }

  onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.fileError.set('');
    this.previewUrl.set('');
    this.fileName.set('');
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.fileError.set('File is too large. Upload a receipt under 5 MB.');
      return;
    }
    this.fileName.set(file.name);
    if (file.type.startsWith('image/')) this.previewUrl.set(URL.createObjectURL(file));
  }

  submit() {
    if (!this.fileName()) {
      this.fileError.set('Upload your InstaPay receipt to continue.');
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.tx.add(this.form.getRawValue().service, this.usd(), this.fileName());
      this.loading.set(false);
      this.toast.show('Request submitted. We will review your receipt.');
      this.router.navigate(['/dashboard']);
    }, 1200);
  }
}

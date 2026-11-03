import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { ToastService } from '../../services/toast.service';
import { LanguageService } from '../../services/language.service';
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
  lang = inject(LanguageService);
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

  preventNegative(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'
    ];

    if (event.ctrlKey || event.metaKey || allowedKeys.includes(event.key)) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const key = event.key;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const current = input.value;

    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
      return;
    }

    if (key === '.' && current.includes('.')) {
      event.preventDefault();
      return;
    }

    const nextValueString = current.slice(0, start) + key + current.slice(end);
    const nextValue = Number(nextValueString);

    if (!isNaN(nextValue) && nextValue > 1000) {
      event.preventDefault();
    }
  }

  preventNegativePaste(event: ClipboardEvent) {
    const pasteData = event.clipboardData?.getData('text') ?? '';
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    if (!/^\d+(\.\d+)?$/.test(pasteData.trim())) {
      event.preventDefault();
      return;
    }

    const nextValueString = input.value.slice(0, start) + pasteData.trim() +
      input.value.slice(end);
    const nextValue = Number(nextValueString);

    if (isNaN(nextValue) || nextValue < 0 || nextValue > 1000) {
      event.preventDefault();
    }
  }
  private value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
  private status = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });
  usd = computed(() => Number(this.value().amount) || 0);
  quote = computed(() => this.tx.quote(this.usd()));
  invalid = computed(() => {
    this.value();
    return this.form.invalid;
  });

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

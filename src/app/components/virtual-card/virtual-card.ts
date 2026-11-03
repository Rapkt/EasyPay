import { Component, computed, input, signal } from '@angular/core';
import { VirtualCard } from '../../models/transaction.model';

interface CardTheme {
  from: string;
  via: string;
  to: string;
  glow: string;
}

const SERVICE_LOGOS: Record<string, string> = {
  AWS: 'images/services/aws.svg',
  Supabase: 'images/services/supabase.svg',
  Vercel: 'images/services/vercel.svg',
  DigitalOcean: 'images/services/digitalocean.svg',
  OpenAI: 'images/services/openai.svg',
  'Google Cloud': 'images/services/google-cloud.svg',
};

const SERVICE_THEMES: Record<string, CardTheme> = {
  AWS: { from: '#33475b', via: '#1d2836', to: '#0b1218', glow: '#ff9900' },
  Supabase: { from: '#1f3a33', via: '#143129', to: '#081712', glow: '#3ecf8e' },
  Vercel: { from: '#3d3d3d', via: '#1f1f1f', to: '#050505', glow: '#ffffff' },
  DigitalOcean: { from: '#0b5cff', via: '#0645b5', to: '#022253', glow: '#4f9dff' },
  OpenAI: { from: '#2f3b39', via: '#1c2624', to: '#090f0e', glow: '#10a37f' },
  'Google Cloud': { from: '#3a6df0', via: '#2450b8', to: '#0e2563', glow: '#8ab4f8' },
};

const DEFAULT_THEME: CardTheme = {
  from: '#0b6b5b',
  via: '#0f3d3e',
  to: '#0f2a24',
  glow: '#f59e0b',
};

@Component({
  imports: [],
  selector: 'app-virtual-card',
  styleUrl: './virtual-card.css',
  templateUrl: './virtual-card.html',
})
export class VirtualCardComponent {
  card = input.required<VirtualCard>();
  revealed = signal(false);
  copied = signal(false);

  logo = computed(() => SERVICE_LOGOS[this.card().service] ?? null);
  theme = computed(() => SERVICE_THEMES[this.card().service] ?? DEFAULT_THEME);
  background = computed(
    () =>
      `linear-gradient(135deg, ${this.theme().from} 0%, ${this.theme().via} 55%, ${this.theme().to} 100%)`,
  );

  displayNumber = computed(() => {
    const n = this.card().number;
    const shown = this.revealed() ? n : '••••••••••••' + n.slice(-4);
    return shown.replace(/(.{4})/g, '$1 ').trim();
  });

  async copy() {
    try {
      await navigator.clipboard.writeText(this.card().number);
      console.log(this.card().number);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      /* clipboard unavailable: ignore in demo */
    }
  }
}

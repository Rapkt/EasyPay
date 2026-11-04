import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { LanguageService } from '../../services/language.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-shell',
  styleUrl: './shell.css',
  templateUrl: './shell.html',
})
export class ShellComponent {
  toast = inject(ToastService);
  lang = inject(LanguageService);

  readonly isUserMenuOpen = signal(false);

  toggleUserMenu(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isUserMenuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (this.isUserMenuOpen() && target && !target.closest('#user-menu-container')) {
      this.closeUserMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeUserMenu();
  }

  onUserProfile(): void {
    this.closeUserMenu();
    this.toast.show(this.lang.t('shell.profileNotice'));
  }

  onSignOut(): void {
    this.closeUserMenu();
    this.toast.show(this.lang.t('shell.signedOutNotice'));
  }
}

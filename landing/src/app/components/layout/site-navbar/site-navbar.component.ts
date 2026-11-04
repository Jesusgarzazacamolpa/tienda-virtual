import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-site-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-navbar.component.html'
})
export class SiteNavbarComponent {
  readonly menuOpen = signal(false);

  readonly links = [
    { label: 'Soluciones', href: '#soluciones' },
    { label: 'Casos', href: '#casos' },
    { label: 'Metodología', href: '#metodologia' },
    { label: 'Contacto', href: '#contacto' }
  ];

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  readonly roles = this.authService.roles;

  readonly displayName = computed(() => {
    const user = this.authService.user();
    if (!user) {
      return 'Invitado';
    }
    return `${user.firstName} ${user.lastName ?? ''}`.trim() || user.email;
  });

  readonly email = computed(() => this.authService.user()?.email ?? '');

  readonly initials = computed(() =>
    this.displayName()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('')
  );

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}

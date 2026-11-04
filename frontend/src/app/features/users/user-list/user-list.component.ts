import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, viewChild } from '@angular/core';
import { finalize, Subscription } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { ApiError } from '@core/http/api-error';
import { User } from '@core/users/user.models';
import { UserService } from '@core/users/user.service';
import {
  DataTableColumn,
  DataTableComponent,
  EmptyStateComponent,
  SlideOverPanelComponent,
  SmartSearchComponent
} from '@shared/components';
import { UserFormComponent } from '../user-form/user-form.component';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataTableComponent,
    EmptyStateComponent,
    SlideOverPanelComponent,
    SmartSearchComponent,
    UserFormComponent
  ],
  templateUrl: './user-list.component.html'
})
export class UserListComponent {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dateFormatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' });

  private requestSubscription: Subscription | null = null;

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  readonly users = signal<User[]>([]);
  readonly page = signal(0);
  readonly size = signal(PAGE_SIZE_OPTIONS[0]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly loadError = signal<ApiError | null>(null);
  readonly actionError = signal<ApiError | null>(null);
  readonly togglingIds = signal<ReadonlySet<string>>(new Set());

  readonly panelOpen = signal(false);
  readonly editing = signal<User | null>(null);
  readonly userForm = viewChild(UserFormComponent);

  readonly isAdmin = this.authService.isAdmin;

  readonly columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: 'Usuario',
      value: user => `${user.firstName} ${user.lastName ?? ''}`.trim()
    },
    { key: 'email', header: 'Correo', value: user => user.email },
    { key: 'roles', header: 'Roles', value: user => user.roles.join(', ') },
    {
      key: 'status',
      header: 'Estado',
      value: user => (user.enabled ? 'Activo' : 'Inactivo'),
      class: 'whitespace-nowrap'
    },
    { key: 'createdAt', header: 'Alta', value: user => this.formatDate(user.createdAt), class: 'whitespace-nowrap' }
  ];

  readonly trackByUser = (user: User): string => user.id;

  readonly rangeStart = computed(() =>
    this.totalElements() === 0 ? 0 : this.page() * this.size() + 1
  );

  readonly rangeEnd = computed(() => Math.min((this.page() + 1) * this.size(), this.totalElements()));

  readonly emptyTitle = computed(() =>
    this.searchTerm() ? 'Sin coincidencias' : 'Aún no hay usuarios'
  );

  readonly emptyMessage = computed(() =>
    this.searchTerm()
      ? `No encontramos usuarios que coincidan con «${this.searchTerm()}».`
      : 'Crea la primera cuenta para empezar a administrar el acceso al backoffice.'
  );

  readonly emptyActionLabel = computed(() => (this.searchTerm() ? null : 'Crear usuario'));

  constructor() {
    if (this.isAdmin()) {
      this.load();
    } else {
      this.loading.set(false);
    }

    this.destroyRef.onDestroy(() => this.requestSubscription?.unsubscribe());
  }

  load(): void {
    if (!this.isAdmin()) {
      this.loading.set(false);
      return;
    }

    this.requestSubscription?.unsubscribe();
    this.loading.set(true);
    this.loadError.set(null);

    this.requestSubscription = this.userService
      .list(this.searchTerm(), this.page(), this.size())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: response => {
          this.users.set(response.content);
          this.totalElements.set(response.totalElements);
          this.totalPages.set(response.totalPages);

          if (response.content.length === 0 && response.totalElements > 0 && this.page() > 0) {
            this.page.update(page => page - 1);
            this.load();
          }
        },
        error: (apiError: ApiError) => {
          this.users.set([]);
          this.totalElements.set(0);
          this.totalPages.set(0);
          this.loadError.set(apiError);
        }
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.page.set(0);
    this.load();
  }

  changePage(next: number): void {
    if (next < 0 || next >= this.totalPages() || next === this.page()) {
      return;
    }
    this.page.set(next);
    this.load();
  }

  changeSize(event: Event): void {
    const next = Number((event.target as HTMLSelectElement).value);
    if (!PAGE_SIZE_OPTIONS.includes(next) || next === this.size()) {
      return;
    }
    this.size.set(next);
    this.page.set(0);
    this.load();
  }

  openCreate(): void {
    this.editing.set(null);
    this.panelOpen.set(true);
  }

  openEdit(user: User): void {
    this.editing.set(user);
    this.panelOpen.set(true);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  isSaving(): boolean {
    return this.userForm()?.saving() ?? false;
  }

  isFormInvalid(): boolean {
    return this.userForm()?.form.invalid ?? true;
  }

  saveUser(): void {
    this.userForm()?.save();
  }

  onSaved(): void {
    this.panelOpen.set(false);
    this.load();
  }

  isSelf(user: User): boolean {
    return this.authService.user()?.id === user.id;
  }

  isToggling(id: string): boolean {
    return this.togglingIds().has(id);
  }

  toggleStatus(user: User): void {
    if (this.isToggling(user.id)) {
      return;
    }

    const nextEnabled = !user.enabled;
    this.actionError.set(null);
    this.setToggling(user.id, true);
    this.patchLocal(user.id, nextEnabled);

    this.userService
      .updateStatus(user.id, nextEnabled)
      .pipe(finalize(() => this.setToggling(user.id, false)))
      .subscribe({
        next: updated => this.patchLocal(updated.id, updated.enabled),
        error: (apiError: ApiError) => {
          this.patchLocal(user.id, user.enabled);
          this.actionError.set(apiError);
        }
      });
  }

  private setToggling(id: string, toggling: boolean): void {
    const next = new Set(this.togglingIds());
    if (toggling) {
      next.add(id);
    } else {
      next.delete(id);
    }
    this.togglingIds.set(next);
  }

  private patchLocal(id: string, enabled: boolean): void {
    this.users.update(users => users.map(user => (user.id === id ? { ...user, enabled } : user)));
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : this.dateFormatter.format(date);
  }
}

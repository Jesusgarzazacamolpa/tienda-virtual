import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { ApiError } from '@core/http/api-error';
import { User } from '@core/users/user.models';
import { UserService } from '@core/users/user.service';
import { FormInputComponent } from '@shared/components';

interface RoleOption {
  value: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-user-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormInputComponent],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent {
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);

  readonly user = input<User | null>(null);
  readonly saved = output<User>();

  readonly saving = signal(false);
  readonly error = signal<ApiError | null>(null);
  readonly serverErrors = signal<Record<string, string>>({});

  readonly roleOptions: RoleOption[] = [
    { value: 'ADMIN', label: 'Administrador', description: 'Gestiona usuarios, roles y estado de acceso.' },
    { value: 'USER', label: 'Usuario', description: 'Acceso operativo sin administración de cuentas.' }
  ];

  readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    roles: this.formBuilder.nonNullable.control<string[]>(['USER'], [Validators.required])
  });

  readonly isEdit = computed(() => this.user() !== null);

  rolesInvalid(): boolean {
    return this.form.controls.roles.invalid && this.form.controls.roles.touched;
  }

  constructor() {
    effect(() => {
      const user = this.user();
      this.error.set(null);
      this.serverErrors.set({});

      if (user) {
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName ?? '',
          email: user.email,
          roles: [...user.roles]
        });
        this.form.controls.password.disable();
        return;
      }

      this.form.reset({ firstName: '', lastName: '', email: '', password: '', roles: ['USER'] });
      this.form.controls.password.enable();
    });
  }

  hasRole(role: string): boolean {
    return this.form.controls.roles.value.includes(role);
  }

  toggleRole(role: string): void {
    const current = this.form.controls.roles.value;
    const roles = current.includes(role) ? current.filter(item => item !== role) : [...current, role];
    this.form.controls.roles.setValue(roles);
    this.form.controls.roles.markAsTouched();
  }

  serverError(field: string): string | null {
    return this.serverErrors()[field] ?? null;
  }

  save(): void {
    this.normalizeInputs();
    this.form.markAllAsTouched();
    this.error.set(null);
    this.serverErrors.set({});

    if (this.form.invalid || this.saving()) {
      return;
    }

    const raw = this.form.getRawValue();
    const roles = [...raw.roles];
    const user = this.user();
    const base = {
      email: raw.email.trim(),
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim() || null,
      roles
    };

    this.saving.set(true);
    const request$ = user
      ? this.userService.update(user.id, base)
      : this.userService.create({ ...base, password: raw.password });

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: updated => this.saved.emit(updated),
      error: (apiError: ApiError) => this.handleError(apiError)
    });
  }

  private normalizeInputs(): void {
    const controls = this.form.controls;
    const email = controls.email.value.trim();
    if (email !== controls.email.value) {
      controls.email.setValue(email);
    }

    const firstName = controls.firstName.value.trim();
    if (firstName !== controls.firstName.value) {
      controls.firstName.setValue(firstName);
    }
  }

  private handleError(apiError: ApiError): void {
    this.error.set(apiError);

    const fieldErrors: Record<string, string> = {};
    for (const detail of apiError.details) {
      fieldErrors[normalizeField(detail.field)] = detail.message;
    }

    if (Object.keys(fieldErrors).length === 0 && apiError.flowCode === 'RES-002') {
      fieldErrors['email'] = apiError.message;
    }

    this.serverErrors.set(fieldErrors);
  }
}

function normalizeField(field: string): string {
  return field.split(/[.[\]]/)[0];
}

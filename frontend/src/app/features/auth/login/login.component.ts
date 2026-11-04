import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { ApiError } from '@core/http/api-error';
import { FormInputComponent } from '@shared/components';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormInputComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  readonly submitting = signal(false);
  readonly error = signal<ApiError | null>(null);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/users');
    }
  }

  submit(): void {
    const emailControl = this.form.controls.email;
    const trimmedEmail = emailControl.value.trim();
    if (trimmedEmail !== emailControl.value) {
      emailControl.setValue(trimmedEmail);
    }

    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }

    this.error.set(null);
    this.submitting.set(true);
    const { email, password } = this.form.getRawValue();

    this.authService
      .login({ email: email.trim(), password })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl(this.redirectTarget()),
        error: (apiError: ApiError) => this.error.set(apiError)
      });
  }

  private redirectTarget(): string {
    const redirect = this.route.snapshot.queryParamMap.get('redirectTo');
    return redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/users';
  }
}

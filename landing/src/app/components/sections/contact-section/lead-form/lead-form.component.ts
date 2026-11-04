import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { corporateEmailValidator } from '@app/core/leads/corporate-email.validator';
import { LeadChallengeCode } from '@app/core/leads/lead.models';
import { LeadService } from '@app/core/leads/lead.service';

type FieldName = 'fullName' | 'email' | 'company' | 'challenge';

interface ApiErrorBody {
  message?: unknown;
  traceId?: unknown;
}

@Component({
  selector: 'app-lead-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lead-form.component.html'
})
export class LeadFormComponent {
  private readonly leadService = inject(LeadService);

  readonly challenges: { value: LeadChallengeCode; label: string }[] = [
    { value: 'MODERNIZATION', label: 'Modernizar un sistema' },
    { value: 'INTEGRATIONS', label: 'Integrar sistemas' },
    { value: 'CUSTOM_DEVELOPMENT', label: 'Desarrollo a la medida' },
    { value: 'STAFF_AUGMENTATION', label: 'Staff augmentation técnico' }
  ];

  readonly form = inject(FormBuilder).nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, corporateEmailValidator, Validators.maxLength(255)]],
    company: ['', [Validators.required, Validators.maxLength(160)]],
    challenge: ['', [Validators.required]],
    website: ['']
  });

  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly submittedName = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly errorTrace = signal<string | null>(null);

  private readonly attempted = signal(false);

  onSubmit(): void {
    if (this.submitting()) {
      return;
    }

    this.attempted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.errorTrace.set(null);

    this.leadService
      .submit({
        fullName: value.fullName.trim(),
        email: value.email.trim().toLowerCase(),
        company: value.company.trim(),
        challenge: value.challenge as LeadChallengeCode,
        website: value.website
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submittedName.set(value.fullName.trim().split(' ')[0] ?? '');
          this.submitted.set(true);
          this.form.reset({ fullName: '', email: '', company: '', challenge: '', website: '' });
          this.attempted.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          this.errorMessage.set(this.resolveError(error));
          this.errorTrace.set(this.resolveTrace(error));
        }
      });
  }

  startOver(): void {
    this.submitted.set(false);
    this.submittedName.set('');
    this.errorMessage.set(null);
    this.errorTrace.set(null);
  }

  errorFor(field: FieldName): string | null {
    const control = this.form.controls[field];
    if (!control.invalid || (!control.touched && !this.attempted())) {
      return null;
    }

    if (control.hasError('required')) {
      const messages: Record<FieldName, string> = {
        fullName: 'Escribe tu nombre completo.',
        email: 'Escribe tu correo corporativo.',
        company: 'Escribe el nombre de tu empresa.',
        challenge: 'Selecciona un desafío.'
      };
      return messages[field];
    }

    if (field === 'email') {
      if (control.hasError('corporateEmail')) {
        return 'Usa tu correo corporativo (no Gmail, Hotmail, etc.).';
      }
      if (control.hasError('email')) {
        return 'Ingresa un correo válido.';
      }
    }

    if (field === 'fullName' && control.hasError('minlength')) {
      return 'El nombre es demasiado corto.';
    }

    return 'Revisa este campo.';
  }

  private resolveError(error: HttpErrorResponse): string {
    const body = error.error as ApiErrorBody | null;
    if (body && typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    if (error.status === 0) {
      return 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.';
    }
    return 'No pudimos enviar tu solicitud. Intenta de nuevo en unos minutos.';
  }

  private resolveTrace(error: HttpErrorResponse): string | null {
    const body = error.error as ApiErrorBody | null;
    return body && typeof body.traceId === 'string' ? body.traceId : null;
  }
}

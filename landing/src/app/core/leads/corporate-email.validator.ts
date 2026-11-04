import { AbstractControl, ValidationErrors } from '@angular/forms';

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'hotmail.com.mx',
  'outlook.com',
  'outlook.es',
  'live.com',
  'live.com.mx',
  'yahoo.com',
  'yahoo.com.mx',
  'icloud.com',
  'me.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'gmx.com',
  'mail.com'
]);

export function corporateEmailValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (typeof value !== 'string' || !value.includes('@')) {
    return null;
  }

  const domain = value.split('@').pop()?.trim().toLowerCase() ?? '';
  return FREE_EMAIL_DOMAINS.has(domain) ? { corporateEmail: true } : null;
}

import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import type { CheckoutValues } from '@/models/checkout';
import { FormField } from '@/shared/components/FormField';

interface CheckoutContactSectionProps {
  register: UseFormRegister<CheckoutValues>;
  errors: FieldErrors<CheckoutValues>;
}

export function CheckoutContactSection({ register, errors }: CheckoutContactSectionProps) {
  return (
    <fieldset className="surface p-6">
      <legend className="px-1 text-lg font-semibold text-sand-50">Contacto</legend>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <FormField
          label="Nombre completo"
          error={errors.fullName?.message}
          autoComplete="name"
          placeholder="Ana López"
          required
          {...register('fullName')}
        />
        <FormField
          label="Correo"
          type="email"
          error={errors.email?.message}
          autoComplete="email"
          placeholder="ana@empresa.com"
          required
          {...register('email')}
        />
        <FormField
          label="Teléfono"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          error={errors.phone?.message}
          autoComplete="tel-national"
          placeholder="5512345678"
          hint="10 dígitos, sin ladas ni espacios."
          required
          {...register('phone')}
        />
      </div>
    </fieldset>
  );
}

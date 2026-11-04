import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import type { CheckoutValues } from '@/models/checkout';
import { FormField } from '@/shared/components/FormField';

interface CheckoutShippingSectionProps {
  register: UseFormRegister<CheckoutValues>;
  errors: FieldErrors<CheckoutValues>;
}

export function CheckoutShippingSection({ register, errors }: CheckoutShippingSectionProps) {
  return (
    <fieldset className="surface p-6">
      <legend className="px-1 text-lg font-semibold text-sand-50">Envío</legend>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField
            label="Calle y número"
            error={errors.address?.message}
            autoComplete="street-address"
            placeholder="Av. Reforma 123, Col. Centro"
            required
            {...register('address')}
          />
        </div>
        <FormField
          label="Ciudad"
          error={errors.city?.message}
          autoComplete="address-level2"
          placeholder="Guadalajara"
          required
          {...register('city')}
        />
        <FormField
          label="Estado"
          error={errors.state?.message}
          autoComplete="address-level1"
          placeholder="Jalisco"
          required
          {...register('state')}
        />
        <FormField
          label="Código postal"
          inputMode="numeric"
          maxLength={5}
          error={errors.postalCode?.message}
          autoComplete="postal-code"
          placeholder="44100"
          required
          {...register('postalCode')}
        />
      </div>
    </fieldset>
  );
}

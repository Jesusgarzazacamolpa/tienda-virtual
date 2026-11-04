import { CreditCard, Landmark } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import type { CheckoutValues } from '@/models/checkout';
import { FormField } from '@/shared/components/FormField';

interface CheckoutPaymentSectionProps {
  register: UseFormRegister<CheckoutValues>;
  errors: FieldErrors<CheckoutValues>;
  paymentMethod: CheckoutValues['paymentMethod'];
}

const paymentOptions = [
  {
    value: 'card',
    icon: CreditCard,
    title: 'Tarjeta',
    detail: 'Débito o crédito simulada'
  },
  {
    value: 'transfer',
    icon: Landmark,
    title: 'Transferencia',
    detail: 'SPEI simulado'
  }
] as const;

export function CheckoutPaymentSection({
  register,
  errors,
  paymentMethod
}: CheckoutPaymentSectionProps) {
  return (
    <fieldset className="surface p-6">
      <legend className="px-1 text-lg font-semibold text-sand-50">Pago</legend>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {paymentOptions.map(({ value, icon: Icon, title, detail }) => (
          <label key={value} className="cursor-pointer">
            <input type="radio" value={value} className="peer sr-only" {...register('paymentMethod')} />
            <span className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition peer-checked:border-signal-400/60 peer-checked:bg-signal-400/10 peer-focus-visible:ring-2 peer-focus-visible:ring-signal-300">
              <Icon className="mt-0.5 h-5 w-5 text-signal-300" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-sand-50">{title}</span>
                <span className="block text-xs text-sand-100/50">{detail}</span>
              </span>
            </span>
          </label>
        ))}
      </div>

      {paymentMethod === 'card' ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField
              label="Número de tarjeta"
              inputMode="numeric"
              maxLength={19}
              error={errors.cardNumber?.message}
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              hint="Demo: usa 4242 4242 4242 4242."
              required
              {...register('cardNumber')}
            />
          </div>
          <div className="sm:col-span-2">
            <FormField
              label="Nombre en la tarjeta"
              error={errors.cardName?.message}
              autoComplete="cc-name"
              placeholder="Ana López"
              required
              {...register('cardName')}
            />
          </div>
          <FormField
            label="Vencimiento"
            inputMode="numeric"
            maxLength={5}
            error={errors.expiry?.message}
            autoComplete="cc-exp"
            placeholder="12/28"
            required
            {...register('expiry')}
          />
          <FormField
            label="CVV"
            inputMode="numeric"
            maxLength={4}
            error={errors.cvv?.message}
            autoComplete="cc-csc"
            placeholder="123"
            required
            {...register('cvv')}
          />
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-white/10 bg-ink-900/60 p-4 text-sm text-sand-100/65">
          <p className="font-medium text-sand-50">Datos para transferencia (demo)</p>
          <p className="mt-1">CLABE: 0123 4567 8901 2345 67</p>
          <p>Beneficiario: Órbita Demo · Concepto: tu número de pedido.</p>
          <p className="mt-2 text-xs text-sand-100/40">
            No necesitas transferir nada: el pedido es simulado.
          </p>
        </div>
      )}
    </fieldset>
  );
}

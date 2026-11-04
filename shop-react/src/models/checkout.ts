import type { PaymentMethod } from './order';

export interface CheckoutValues {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cardName?: string;
  expiry?: string;
  cvv?: string;
}

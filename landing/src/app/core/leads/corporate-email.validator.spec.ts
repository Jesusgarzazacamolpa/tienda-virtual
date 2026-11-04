import { FormControl } from '@angular/forms';

import { corporateEmailValidator } from './corporate-email.validator';

describe('corporateEmailValidator', () => {
  it('rechaza proveedores de correo gratuitos', () => {
    for (const email of ['ana@gmail.com', 'ana@HOTMAIL.com', 'ana@outlook.es', 'ana@proton.me']) {
      expect(corporateEmailValidator(new FormControl(email)))
        .withContext(email)
        .toEqual({ corporateEmail: true });
    }
  });

  it('acepta dominios corporativos', () => {
    expect(corporateEmailValidator(new FormControl('ana@garza.com.mx'))).toBeNull();
    expect(corporateEmailValidator(new FormControl('contacto@grupo-bajio.mx'))).toBeNull();
  });

  it('no valida formatos incompletos para no duplicar el error de email', () => {
    expect(corporateEmailValidator(new FormControl('ana'))).toBeNull();
    expect(corporateEmailValidator(new FormControl(''))).toBeNull();
  });
});

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LeadFormComponent } from './lead-form/lead-form.component';

@Component({
  selector: 'app-contact-section',
  imports: [LeadFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-section.component.html'
})
export class ContactSectionComponent {
  readonly assurances = [
    'Auditoría técnica sin costo y sin compromiso.',
    'Firmamos NDA antes de revisar tu operación.',
    'Respondemos en menos de 24 horas hábiles.'
  ];
}

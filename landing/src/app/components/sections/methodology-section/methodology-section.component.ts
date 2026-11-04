import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionHeadingComponent } from '../../ui/section-heading/section-heading.component';

interface Pillar {
  title: string;
  description: string;
  paths: string[];
}

@Component({
  selector: 'app-methodology-section',
  imports: [SectionHeadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './methodology-section.component.html'
})
export class MethodologySectionComponent {
  readonly pillars: Pillar[] = [
    {
      title: 'Entendimiento del Negocio',
      description: 'No tiramos código hasta entender cómo operas, facturas y entregas.',
      paths: [
        'M2.25 12c0-2.9 3.6-5.25 8.25-5.25S18.75 9.1 18.75 12s-3.6 5.25-8.25 5.25S2.25 14.9 2.25 12Z',
        'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
        'M21 12c0 1.2-.8 2.25-2.25 2.25'
      ]
    },
    {
      title: 'Seguridad por Diseño',
      description: 'Implementación de arquitecturas seguras y datos sensibles bajo tu control.',
      paths: [
        'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z'
      ]
    },
    {
      title: 'Transparencia Total',
      description: 'Visibilidad completa del avance, despliegues continuos y código de tu propiedad.',
      paths: [
        'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z',
        'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
      ]
    }
  ];
}

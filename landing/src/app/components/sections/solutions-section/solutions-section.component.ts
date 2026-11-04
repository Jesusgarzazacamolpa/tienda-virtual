import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionHeadingComponent } from '../../ui/section-heading/section-heading.component';

interface Solution {
  step: string;
  title: string;
  description: string;
  tags: string[];
  paths: string[];
}

@Component({
  selector: 'app-solutions-section',
  imports: [SectionHeadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solutions-section.component.html'
})
export class SolutionsSectionComponent {
  readonly solutions: Solution[] = [
    {
      step: '01',
      title: 'Modernización y Arquitectura Cloud-Native',
      description:
        'Rescatamos operaciones limitadas por sistemas lentos u obsoletos. Migramos aplicaciones a arquitecturas de microservicios robustas para garantizar alta disponibilidad y tolerancia a fallos, ideal para el sector financiero y corporativo.',
      tags: ['Microservicios', 'Alta disponibilidad', 'Tolerancia a fallos'],
      paths: [
        'M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z'
      ]
    },
    {
      step: '02',
      title: 'Equipos Técnicos Dedicados (Staff Augmentation)',
      description:
        'Reforzamos tu operación con ingenieros senior que trabajan dentro de tus procesos. Entregamos con revisiones de código, pruebas automatizadas y transferencia de conocimiento para que tu equipo no dependa de una sola persona.',
      tags: ['Ingenieros senior', 'Revisiones de código', 'Transferencia'],
      paths: [
        'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z'
      ]
    },
    {
      step: '03',
      title: 'Ecosistemas Digitales para Operaciones Físicas',
      description:
        'Conectamos tu realidad física con el mundo digital. Desarrollamos plataformas logísticas, control de flotillas con geocercas y sistemas de comercio electrónico (B2B/B2C) que se integran nativamente con tu inventario real.',
      tags: ['Geocercas', 'Logística', 'E-commerce B2B/B2C'],
      paths: [
        'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
        'M3.6 9h16.8M3.6 15h16.8',
        'M12 3a15.75 15.75 0 0 1 0 18 15.75 15.75 0 0 1 0-18Z'
      ]
    }
  ];
}

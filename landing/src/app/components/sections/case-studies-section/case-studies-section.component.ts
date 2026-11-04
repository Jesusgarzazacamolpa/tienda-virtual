import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionHeadingComponent } from '../../ui/section-heading/section-heading.component';

interface CaseStudy {
  industry: string;
  challenge: string;
  solution: string;
  impact: string;
}

@Component({
  selector: 'app-case-studies-section',
  imports: [SectionHeadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './case-studies-section.component.html'
})
export class CaseStudiesSectionComponent {
  readonly cases: CaseStudy[] = [
    {
      industry: 'Sector financiero',
      challenge: 'Trazabilidad nula y caídas de sistema durante picos transaccionales.',
      solution:
        'Desacoplamiento a microservicios en Java Spring Boot con microfrontends en Angular.',
      impact:
        'Sistema resiliente, cero caídas en días críticos y reportes automatizados para negocio.'
    },
    {
      industry: 'E-commerce y logística',
      challenge: 'Desconexión entre la tienda en línea y las reglas logísticas de entrega física.',
      solution:
        'Migración de monolito a arquitectura Node.js + ReactJS con integración de mapas y geocercas personalizadas.',
      impact:
        'Operación escalable con rutas y zonas de distribución automatizadas desde la compra.'
    },
    {
      industry: 'Sector retail',
      challenge: 'Alta de proveedores dispersa en correos y hojas de cálculo, sin trazabilidad.',
      solution:
        'Portal B2B en Angular y Spring Boot con captura documental, roles y flujo de aprobación.',
      impact:
        'Proceso centralizado y auditable, con menos retrabajo y tiempos de alta más cortos.'
    }
  ];
}

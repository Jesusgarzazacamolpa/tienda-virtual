import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-section.component.html'
})
export class HeroSectionComponent {
  readonly capabilities = [
    'Seguridad de grado bancario',
    'Equipos técnicos dedicados',
    'Código de tu propiedad'
  ];
}

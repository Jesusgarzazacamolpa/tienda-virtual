import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.component.html'
})
export class EmptyStateComponent {
  readonly title = input('No hay resultados');
  readonly message = input('Aún no hay información para mostrar.');
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}

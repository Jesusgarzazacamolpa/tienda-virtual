import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton-loader.component.html'
})
export class SkeletonLoaderComponent {
  readonly rows = input(3);
  readonly columns = input(4);

  readonly rowsArray = computed(() => Array.from({ length: Math.max(1, this.rows()) }));
  readonly columnsArray = computed(() => Array.from({ length: Math.max(1, this.columns()) }));
  readonly gridTemplate = computed(() => `repeat(${this.columnsArray().length}, minmax(0, 1fr))`);

  barWidth(index: number): number {
    return 55 + ((index * 17) % 40);
  }
}

import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, contentChild, input, output } from '@angular/core';

import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  value: (row: T) => string | number | null | undefined;
  align?: 'left' | 'center' | 'right';
  class?: string;
}

export interface DataTableRowContext<T> {
  $implicit: T;
}

@Component({
  selector: 'app-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, EmptyStateComponent, SkeletonLoaderComponent],
  templateUrl: './data-table.component.html'
})
export class DataTableComponent<T> {
  readonly columns = input.required<DataTableColumn<T>[]>();
  readonly rows = input.required<T[]>();
  readonly loading = input(false);
  readonly emptyTitle = input('Sin resultados');
  readonly emptyMessage = input('No hay información para mostrar todavía.');
  readonly emptyActionLabel = input<string | null>(null);
  readonly trackBy = input<(row: T) => unknown>(row => row);

  readonly rowClick = output<T>();
  readonly emptyAction = output<void>();

  readonly rowActions = contentChild<TemplateRef<DataTableRowContext<T>>>('rowActions');

  readonly skeletonColumns = computed(() => this.columns().length + (this.rowActions() ? 1 : 0));

  columnClasses(column: DataTableColumn<T>): string {
    const align = column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left';
    return column.class ? `${align} ${column.class}` : align;
  }

  displayValue(column: DataTableColumn<T>, row: T): string | number {
    const value = column.value(row);
    return value === null || value === undefined || value === '' ? '—' : value;
  }
}

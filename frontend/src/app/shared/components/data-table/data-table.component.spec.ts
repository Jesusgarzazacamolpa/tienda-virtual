import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableColumn, DataTableComponent } from './data-table.component';

interface Row {
  id: number;
  name: string;
  email: string | null;
}

@Component({
  standalone: true,
  imports: [DataTableComponent],
  template: `
    <app-data-table
      [columns]="columns"
      [rows]="rows"
      [loading]="loading"
      emptyTitle="Sin usuarios"
      emptyMessage="Crea el primer usuario para empezar."
      emptyActionLabel="Crear usuario"
      (emptyAction)="emptyClicks = emptyClicks + 1"
      (rowClick)="clickedRow = $event.name"
    >
      <ng-template #rowActions let-row>
        <button type="button" class="edit-button" (click)="edited.push(row.name)">Editar</button>
      </ng-template>
    </app-data-table>
  `
})
class HostComponent {
  readonly columns: DataTableColumn<Row>[] = [
    { key: 'name', header: 'Nombre', value: row => row.name },
    { key: 'email', header: 'Correo', value: row => row.email }
  ];

  rows: Row[] = [];
  loading = false;
  emptyClicks = 0;
  clickedRow = '';
  readonly edited: string[] = [];
}

describe('DataTableComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('renders skeleton loaders while loading', () => {
    host.loading = true;
    fixture.detectChanges();

    expect(element().querySelector('app-skeleton-loader')).not.toBeNull();
    expect(element().querySelector('table')).toBeNull();
    expect(element().querySelector('app-empty-state')).toBeNull();
  });

  it('renders the empty state and emits its action', () => {
    fixture.detectChanges();

    expect(element().querySelector('app-empty-state')?.textContent).toContain('Sin usuarios');

    (element().querySelector('app-empty-state button') as HTMLButtonElement).click();

    expect(host.emptyClicks).toBe(1);
  });

  it('renders rows, headers and a dash for empty values', () => {
    host.rows = [
      { id: 1, name: 'Ana', email: 'ana@empresa.com' },
      { id: 2, name: 'Luis', email: null }
    ];
    fixture.detectChanges();

    const headers = Array.from(element().querySelectorAll('th'));
    expect(headers.map(header => header.textContent?.trim())).toEqual(['Nombre', 'Correo', 'Acciones']);
    expect(headers[0].className).toContain('px-4');
    expect(headers[0].className).toContain('text-left');

    const rows = Array.from(element().querySelectorAll('tbody tr'));
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Ana');
    expect(rows[0].textContent).toContain('ana@empresa.com');
    expect(rows[1].textContent).toContain('—');
  });

  it('emits the clicked row and renders the actions template', () => {
    host.rows = [{ id: 1, name: 'Ana', email: 'ana@empresa.com' }];
    fixture.detectChanges();

    const editButton = element().querySelector('button.edit-button') as HTMLButtonElement;
    expect(editButton).not.toBeNull();

    editButton.click();
    expect(host.edited).toEqual(['Ana']);
    expect(host.clickedRow).toBe('');

    (element().querySelector('tbody tr') as HTMLTableRowElement).click();
    expect(host.clickedRow).toBe('Ana');
  });
});

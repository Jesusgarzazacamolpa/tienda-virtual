import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploaderComponent } from './file-uploader.component';

function fileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  return dataTransfer.files;
}

function pdf(name: string, content = '0123456789'): File {
  return new File([content], name, { type: 'application/pdf' });
}

describe('FileUploaderComponent', () => {
  let fixture: ComponentFixture<FileUploaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FileUploaderComponent] });
    fixture = TestBed.createComponent(FileUploaderComponent);
    fixture.detectChanges();
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('accepts a valid file and shows its name and size', () => {
    fixture.componentRef.setInput('accept', ['.pdf']);
    const emitted: File[][] = [];
    fixture.componentInstance.filesSelected.subscribe(files => emitted.push(files));

    fixture.componentInstance.handleFiles(fileList([pdf('cv.pdf')]));
    fixture.detectChanges();

    expect(emitted.length).toBe(1);
    expect(emitted[0][0].name).toBe('cv.pdf');
    expect(fixture.componentInstance.error()).toBeNull();
    expect(element().textContent).toContain('cv.pdf');
    expect(element().textContent).toContain('10 B');
  });

  it('rejects files with a disallowed extension', () => {
    fixture.componentRef.setInput('accept', ['.pdf']);
    const emitted: File[][] = [];
    fixture.componentInstance.filesSelected.subscribe(files => emitted.push(files));

    fixture.componentInstance.handleFiles(
      fileList([new File(['x'], 'script.exe', { type: 'application/x-msdownload' })])
    );
    fixture.detectChanges();

    expect(emitted).toEqual([]);
    expect(fixture.componentInstance.error()).toContain('no tiene un formato permitido');
    expect(element().querySelector('[role="alert"]')?.textContent).toContain('script.exe');
  });

  it('keeps the base dropzone styles when the tone changes', () => {
    fixture.componentRef.setInput('accept', ['.pdf']);
    fixture.componentInstance.handleFiles(fileList([pdf('cv.pdf')]));
    fixture.detectChanges();

    const dropzone = element().querySelector('[role="button"]') as HTMLElement;
    expect(dropzone.className).toContain('flex');
    expect(dropzone.className).toContain('cursor-pointer');
    expect(dropzone.className).toContain('border-white/10');
  });

  it('rejects files over the size limit', () => {
    fixture.componentRef.setInput('accept', ['.pdf']);
    fixture.componentRef.setInput('maxSizeMb', 0.000001);

    fixture.componentInstance.handleFiles(fileList([pdf('grande.pdf', '0123456789')]));
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toContain('supera el máximo');
  });

  it('keeps only the first file when multiple is disabled', () => {
    const emitted: File[][] = [];
    fixture.componentInstance.filesSelected.subscribe(files => emitted.push(files));

    fixture.componentInstance.handleFiles(fileList([pdf('uno.pdf'), pdf('dos.pdf')]));

    expect(emitted.length).toBe(1);
    expect(emitted[0].map(file => file.name)).toEqual(['uno.pdf']);
  });

  it('keeps all files and allows removing one when multiple is enabled', () => {
    fixture.componentRef.setInput('multiple', true);
    const emitted: File[][] = [];
    fixture.componentInstance.filesSelected.subscribe(files => emitted.push(files));

    fixture.componentInstance.handleFiles(fileList([pdf('uno.pdf'), pdf('dos.pdf')]));
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedFiles().length).toBe(2);

    (element().querySelector('button[aria-label="Quitar uno.pdf"]') as HTMLButtonElement).click();

    expect(fixture.componentInstance.selectedFiles().map(file => file.name)).toEqual(['dos.pdf']);
    expect(emitted.at(-1)?.map(file => file.name)).toEqual(['dos.pdf']);
  });

  it('selects files dropped onto the dropzone', () => {
    const emitted: File[][] = [];
    fixture.componentInstance.filesSelected.subscribe(files => emitted.push(files));

    const dropzone = element().querySelector('[role="button"]') as HTMLElement;
    dropzone.dispatchEvent(
      new DragEvent('drop', { dataTransfer: new DataTransfer(), bubbles: true, cancelable: true })
    );

    expect(emitted).toEqual([]);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(pdf('drop.pdf'));
    dropzone.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true, cancelable: true }));

    expect(emitted.length).toBe(1);
    expect(emitted[0][0].name).toBe('drop.pdf');
  });
});

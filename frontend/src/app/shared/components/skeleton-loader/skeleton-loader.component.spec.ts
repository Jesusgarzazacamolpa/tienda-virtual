import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonLoaderComponent } from './skeleton-loader.component';

describe('SkeletonLoaderComponent', () => {
  let fixture: ComponentFixture<SkeletonLoaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SkeletonLoaderComponent] });
    fixture = TestBed.createComponent(SkeletonLoaderComponent);
  });

  it('renders rows multiplied by columns placeholders', () => {
    fixture.componentRef.setInput('rows', 2);
    fixture.componentRef.setInput('columns', 3);
    fixture.detectChanges();

    const bars = (fixture.nativeElement as HTMLElement).querySelectorAll('.animate-pulse');
    expect(bars.length).toBe(6);
  });

  it('always renders at least one row and one column', () => {
    fixture.componentRef.setInput('rows', 0);
    fixture.componentRef.setInput('columns', 0);
    fixture.detectChanges();

    const bars = (fixture.nativeElement as HTMLElement).querySelectorAll('.animate-pulse');
    expect(bars.length).toBe(1);
  });
});

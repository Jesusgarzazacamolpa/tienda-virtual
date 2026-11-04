import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-footer.component.html'
})
export class SiteFooterComponent {
  readonly year = new Date().getFullYear();
}

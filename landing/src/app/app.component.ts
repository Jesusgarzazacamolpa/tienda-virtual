import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SiteFooterComponent } from './components/layout/site-footer/site-footer.component';
import { SiteNavbarComponent } from './components/layout/site-navbar/site-navbar.component';
import { CaseStudiesSectionComponent } from './components/sections/case-studies-section/case-studies-section.component';
import { ContactSectionComponent } from './components/sections/contact-section/contact-section.component';
import { HeroSectionComponent } from './components/sections/hero-section/hero-section.component';
import { MethodologySectionComponent } from './components/sections/methodology-section/methodology-section.component';
import { SolutionsSectionComponent } from './components/sections/solutions-section/solutions-section.component';
import { TechStackSectionComponent } from './components/sections/tech-stack-section/tech-stack-section.component';

@Component({
  selector: 'app-root',
  imports: [
    SiteNavbarComponent,
    HeroSectionComponent,
    SolutionsSectionComponent,
    CaseStudiesSectionComponent,
    TechStackSectionComponent,
    MethodologySectionComponent,
    ContactSectionComponent,
    SiteFooterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html'
})
export class AppComponent {}

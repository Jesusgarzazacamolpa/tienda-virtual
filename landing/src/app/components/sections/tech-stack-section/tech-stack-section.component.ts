import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionHeadingComponent } from '../../ui/section-heading/section-heading.component';

interface Technology {
  name: string;
  dot: string;
}

@Component({
  selector: 'app-tech-stack-section',
  imports: [SectionHeadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tech-stack-section.component.html'
})
export class TechStackSectionComponent {
  readonly technologies: Technology[] = [
    { name: 'Java', dot: 'bg-orange-400' },
    { name: 'Spring Boot', dot: 'bg-emerald-400' },
    { name: 'Node.js', dot: 'bg-lime-400' },
    { name: 'React', dot: 'bg-sky-400' },
    { name: 'Angular', dot: 'bg-rose-400' },
    { name: 'PostgreSQL', dot: 'bg-blue-500' },
    { name: 'Google Cloud', dot: 'bg-amber-400' },
    { name: 'Docker', dot: 'bg-cyan-400' }
  ];

  readonly marquee: Technology[] = [...this.technologies, ...this.technologies];
}

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  DialogComponent,
  FileUploaderComponent,
  FormInputComponent,
  SearchSelectComponent,
  SearchSelectOption,
  SkeletonLoaderComponent,
  SmartSearchComponent
} from '@shared/components';

interface Option {
  value: string;
  label: string;
}

interface RoleOption extends Option {
  description: string;
}

interface ClientSummary {
  company: string;
  contact: string;
  email: string;
  industry: string;
  owner: string;
  employees: string;
  notifications: boolean;
  logo: string;
}

interface RecentMember {
  initials: string;
  name: string;
  email: string;
  role: string;
  access: string;
}

interface CompanyProfile {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  employees: string;
  industry: string;
  website: string;
  city: string;
}

@Component({
  selector: 'app-form-examples',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscape()'
  },
  imports: [
    ReactiveFormsModule,
    DialogComponent,
    FormInputComponent,
    FileUploaderComponent,
    SearchSelectComponent,
    SkeletonLoaderComponent,
    SmartSearchComponent
  ],
  templateUrl: './form-examples.component.html'
})
export class FormExamplesComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly companyDirectory: CompanyProfile[] = [
    {
      id: 'acme',
      companyName: 'Acme Soluciones',
      contactName: 'Ana López',
      email: 'ana@acme.com',
      phone: '818 123 4567',
      employees: '25',
      industry: 'technology',
      website: 'https://acme.com',
      city: 'Monterrey, N.L.'
    },
    {
      id: 'norte',
      companyName: 'Grupo Norte',
      contactName: 'Luis Ramírez',
      email: 'luis@gruponorte.mx',
      phone: '555 987 6543',
      employees: '120',
      industry: 'manufacturing',
      website: 'https://gruponorte.mx',
      city: 'Ciudad de México'
    },
    {
      id: 'clinica',
      companyName: 'Clínica del Valle',
      contactName: 'Sofía Herrera',
      email: 'sofia@clinicavalle.mx',
      phone: '442 456 7890',
      employees: '48',
      industry: 'health',
      website: 'https://clinicavalle.mx',
      city: 'Querétaro, Qro.'
    },
    {
      id: 'tienda',
      companyName: 'Tienda Central',
      contactName: 'Carlos Méndez',
      email: 'carlos@tiendacentral.com',
      phone: '333 222 1100',
      employees: '12',
      industry: 'retail',
      website: 'https://tiendacentral.com',
      city: 'Guadalajara, Jal.'
    },
    {
      id: 'capital',
      companyName: 'Capital Seguro',
      contactName: 'María Torres',
      email: 'maria@capitalseguro.com',
      phone: '551 444 8899',
      employees: '300',
      industry: 'finance',
      website: 'https://capitalseguro.com',
      city: 'Ciudad de México'
    }
  ];

  readonly industries: Option[] = [
    { value: 'technology', label: 'Tecnología' },
    { value: 'retail', label: 'Retail y consumo' },
    { value: 'finance', label: 'Servicios financieros' },
    { value: 'health', label: 'Salud' },
    { value: 'manufacturing', label: 'Manufactura' }
  ];

  readonly accountManagers: SearchSelectOption[] = [
    { value: 'ana', label: 'Ana López', description: 'Enterprise · Monterrey' },
    { value: 'luis', label: 'Luis Ramírez', description: 'Retail · Ciudad de México' },
    { value: 'sofia', label: 'Sofía Herrera', description: 'Salud · Querétaro' },
    { value: 'carlos', label: 'Carlos Méndez', description: 'Consumo · Guadalajara' },
    { value: 'maria', label: 'María Torres', description: 'Finanzas · Ciudad de México' }
  ];

  readonly recentMembers: RecentMember[] = [
    { initials: 'AL', name: 'Ana López', email: 'ana@acme.com', role: 'ADMIN', access: 'Hace 5 min' },
    { initials: 'LR', name: 'Luis Ramírez', email: 'luis@gruponorte.mx', role: 'USER', access: 'Hace 18 min' },
    { initials: 'SH', name: 'Sofía Herrera', email: 'sofia@clinicavalle.mx', role: 'USER', access: 'Hoy, 09:12' },
    { initials: 'CM', name: 'Carlos Méndez', email: 'carlos@tiendacentral.com', role: 'USER', access: 'Ayer, 18:40' },
    { initials: 'MT', name: 'María Torres', email: 'maria@capitalseguro.com', role: 'ADMIN', access: 'Ayer, 16:05' }
  ];

  readonly inviteRoles: RoleOption[] = [
    { value: 'USER', label: 'Usuario', description: 'Acceso operativo sin administración de cuentas.' },
    { value: 'ADMIN', label: 'Administrador', description: 'Gestiona usuarios, roles y estado de acceso.' }
  ];

  readonly languages: Option[] = [
    { value: 'es-MX', label: 'Español (México)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'pt-BR', label: 'Português (Brasil)' }
  ];

  readonly timezones: Option[] = [
    { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
    { value: 'America/Monterrey', label: 'Monterrey (GMT-6)' },
    { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' }
  ];

  readonly clientForm = this.formBuilder.nonNullable.group({
    companyName: ['', [Validators.required, Validators.maxLength(120)]],
    contactName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    employees: ['', [Validators.required, Validators.pattern(/^\d{1,5}$/)]],
    industry: ['', [Validators.required]],
    owner: ['', [Validators.required]],
    website: ['', [Validators.pattern(/^https?:\/\/[^\s]+$/)]],
    notes: ['', [Validators.maxLength(500)]],
    notifications: [true]
  });

  readonly inviteForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['USER', [Validators.required]],
    message: ['', [Validators.maxLength(300)]]
  });

  readonly settingsForm = this.formBuilder.nonNullable.group({
    language: ['es-MX', [Validators.required]],
    timezone: ['America/Mexico_City', [Validators.required]],
    sessionMinutes: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
    digest: [true],
    productUpdates: [false]
  });

  readonly companyQuery = signal('');
  readonly companyResultsOpen = signal(false);
  readonly companyApplied = signal<string | null>(null);
  readonly logo = signal<File | null>(null);
  readonly clientSaving = signal(false);
  readonly clientSaved = signal<ClientSummary | null>(null);
  readonly inviteSaving = signal(false);
  readonly inviteSentTo = signal<string | null>(null);
  readonly settingsSaved = signal(false);
  readonly membersLoading = signal(false);
  readonly dialogOpen = signal(false);
  readonly dialogConfirmed = signal(false);

  private readonly companySearch = viewChild(SmartSearchComponent);
  private readonly companySearchWrap = viewChild<ElementRef<HTMLElement>>('companySearchWrap');
  private readonly destroyRef = inject(DestroyRef);
  private membersTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.membersTimer !== null) {
        clearTimeout(this.membersTimer);
      }
    });
  }

  readonly companyResults = computed(() => {
    const query = this.companyQuery().trim().toLowerCase();
    if (query.length === 0) {
      return [];
    }

    return this.companyDirectory
      .filter(company =>
        [company.companyName, company.contactName, company.email, company.city]
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 5);
  });

  showError(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  controlClasses(form: FormGroup, field: string, extra = ''): string {
    const shared =
      'w-full rounded-lg border bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 [&>option]:bg-slate-900';
    const tone = this.showError(form, field)
      ? 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/30'
      : 'border-white/10 hover:border-white/20 focus:border-brand-400 focus:ring-brand-500/30';
    return extra ? `${shared} ${tone} ${extra}` : `${shared} ${tone}`;
  }

  industryLabel(value: string): string {
    return this.industries.find(option => option.value === value)?.label ?? value;
  }

  onCompanySearch(term: string): void {
    this.companyQuery.set(term);
    this.companyResultsOpen.set(term.trim().length > 0);
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.companyResultsOpen()) {
      return;
    }

    const wrap = this.companySearchWrap()?.nativeElement;
    if (wrap && event.target instanceof Node && wrap.contains(event.target)) {
      return;
    }

    this.companyResultsOpen.set(false);
  }

  onEscape(): void {
    if (this.companyResultsOpen()) {
      this.clearCompanySearch();
    }
  }

  applyCompany(company: CompanyProfile): void {
    this.clientForm.patchValue({
      companyName: company.companyName,
      contactName: company.contactName,
      email: company.email,
      phone: company.phone,
      employees: company.employees,
      industry: company.industry,
      website: company.website
    });
    this.clientSaved.set(null);
    this.companyApplied.set(company.companyName);
    this.clearCompanySearch();
  }

  onLogoSelected(files: File[]): void {
    this.logo.set(files[0] ?? null);
  }

  simulateMembersLoad(): void {
    if (this.membersTimer !== null) {
      clearTimeout(this.membersTimer);
    }
    this.membersLoading.set(true);
    this.membersTimer = setTimeout(() => {
      this.membersTimer = null;
      this.membersLoading.set(false);
    }, 1200);
  }

  submitClient(): void {
    this.normalizeClientInputs();
    this.clientForm.markAllAsTouched();
    if (this.clientForm.invalid || this.clientSaving()) {
      return;
    }

    const raw = this.clientForm.getRawValue();
    this.clientSaving.set(true);
    setTimeout(() => {
      this.clientSaved.set({
        company: raw.companyName.trim(),
        contact: raw.contactName.trim(),
        email: raw.email.trim(),
        industry: this.industryLabel(raw.industry),
        owner: this.accountManagers.find(option => option.value === raw.owner)?.label ?? raw.owner,
        employees: raw.employees,
        notifications: raw.notifications,
        logo: this.logo()?.name ?? 'Sin archivo'
      });
      this.clientSaving.set(false);
    }, 600);
  }

  resetClient(): void {
    this.clientForm.reset({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      employees: '',
      industry: '',
      owner: '',
      website: '',
      notes: '',
      notifications: true
    });
    this.clientForm.markAsUntouched();
    this.logo.set(null);
    this.clientSaved.set(null);
    this.companyApplied.set(null);
    this.clearCompanySearch();
  }

  submitInvite(): void {
    const emailControl = this.inviteForm.controls.email;
    const email = emailControl.value.trim();
    if (email !== emailControl.value) {
      emailControl.setValue(email);
    }

    this.inviteForm.markAllAsTouched();
    if (this.inviteForm.invalid || this.inviteSaving()) {
      return;
    }

    this.inviteSaving.set(true);
    setTimeout(() => {
      this.inviteSentTo.set(email);
      this.inviteSaving.set(false);
    }, 500);
  }

  resetInvite(): void {
    this.inviteForm.reset({ email: '', role: 'USER', message: '' });
    this.inviteForm.markAsUntouched();
    this.inviteSentTo.set(null);
  }

  saveSettings(): void {
    this.settingsForm.markAllAsTouched();
    if (this.settingsForm.invalid) {
      return;
    }
    this.settingsSaved.set(true);
  }

  openDialog(): void {
    this.dialogConfirmed.set(false);
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  confirmDialog(): void {
    this.dialogConfirmed.set(true);
    this.dialogOpen.set(false);
  }

  private clearCompanySearch(): void {
    if (this.companyQuery().length > 0 || this.companyResultsOpen()) {
      this.companySearch()?.clear();
      return;
    }

    this.companyResultsOpen.set(false);
  }

  private normalizeClientInputs(): void {
    const controls = this.clientForm.controls;
    const fields = ['companyName', 'contactName', 'email', 'website'] as const;

    for (const field of fields) {
      const control = controls[field];
      const trimmed = control.value.trim();
      if (trimmed !== control.value) {
        control.setValue(trimmed);
      }
    }
  }

  resetSettings(): void {
    this.settingsForm.reset({
      language: 'es-MX',
      timezone: 'America/Mexico_City',
      sessionMinutes: 30,
      digest: true,
      productUpdates: false
    });
    this.settingsForm.markAsUntouched();
    this.settingsSaved.set(false);
  }
}

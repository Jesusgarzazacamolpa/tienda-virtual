export type LeadChallengeCode = 'MODERNIZATION' | 'INTEGRATIONS' | 'CUSTOM_DEVELOPMENT' | 'STAFF_AUGMENTATION';

export interface LeadPayload {
  fullName: string;
  email: string;
  company: string;
  challenge: LeadChallengeCode;
  website: string;
}

export interface LeadCreated {
  id: string;
  createdAt: string;
}

export enum JobDomain {
  WEB = 'Web',
  MOBILE = 'Mobile',
  DEVOPS = 'DevOps',
  DATA = 'Data',
  QA_SECURITY = 'QA & Security',
  DESIGN = 'Design',
  MANAGEMENT = 'Management',
}

export const VALID_DOMAINS: JobDomain[] = Object.values(JobDomain);

export function isValidDomain(domain: string): boolean {
  return VALID_DOMAINS.includes(domain as JobDomain);
}

export function getDomainKey(domain: JobDomain): string {
  return domain.toLowerCase().replace(/ /g, '_').replace(/&/g, 'and');
}

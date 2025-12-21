export interface IAnalytics {
  type: string;
  title: string;
  chart_type: string;
  domain?: string;
  data: any[];
  metadata: {
    total_jobs?: number;
    total_cities?: number;
    total_mentions?: number;
    last_updated: Date;
    [key: string]: any;
  };
}

// dashboard interface
export interface IDashboardOverviewResponse {
  dashboard: 'overview';
  charts: IAnalytics[];
  total: number;
}

export interface IDashboardDomainResponse {
  dashboard: 'domain';
  domain: string;
  charts: IAnalytics[];
  total: number;
}

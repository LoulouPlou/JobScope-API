import {
  IDashboardDomainResponse,
  IDashboardOverviewResponse,
} from '../interfaces/analytics.interface';
import { AnalyticsModel } from '../models/analytics.model';
import {
  JobDomain,
  isValidDomain,
  VALID_DOMAINS,
  getDomainKey,
} from '../constants/domains.constant';

export class AnalyticsService {
  static async getOverviewDashboard(): Promise<IDashboardOverviewResponse> {
    const analytics = await AnalyticsModel.find({
      type: {
        $in: [
          'top_programming_languages',
          'top_cities',
          'top_hard_skills_no_lang',
          'top_soft_skills',
          'job_type_distribution',
        ],
      },
    });

    return {
      dashboard: 'overview',
      charts: analytics,
      total: analytics.length,
    };
  }

  static async getDomainDashboard(domain: string): Promise<IDashboardDomainResponse> {
    if (!isValidDomain(domain)) {
      throw new Error(`Invalid domain: ${domain}. Must be one of: ${VALID_DOMAINS.join(', ')}`);
    }

    const domainKey = getDomainKey(domain as JobDomain);

    const analytics = await AnalyticsModel.find({
      $or: [
        { type: `top_cities_${domainKey}` },
        { type: `top_technologies_${domainKey}` },
        { type: `radar_domain_${domainKey}` },
        { type: `seniority_distribution_${domainKey}` },
      ],
    });

    return {
      dashboard: 'domain',
      domain: domain,
      charts: analytics,
      total: analytics.length,
    };
  }
}

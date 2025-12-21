import { AnalyticsService } from '../../src/services/analytics.service';
import { AnalyticsModel } from '../../src/models/analytics.model';

jest.mock('../../src/models/analytics.model');

describe('AnalyticsService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //getOverviewDashboard()
  test('getOverviewDashboard, should return overview dashboard data', async () => {
    const mockAnalytics = [
      { type: 'top_programming_languages', data: [] },
      { type: 'top_cities', data: [] },
    ];

    (AnalyticsModel.find as jest.Mock).mockResolvedValue(mockAnalytics);

    const result = await AnalyticsService.getOverviewDashboard();

    expect(AnalyticsModel.find).toHaveBeenCalledWith({
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

    expect(result).toEqual({
      dashboard: 'overview',
      charts: mockAnalytics,
      total: 2,
    });
  });

  //getDomainDashboard()
  test('getDomainDashboard, should return domain dashboard data', async () => {
    const mockAnalytics = [
      { type: 'top_cities_web', data: [] },
      { type: 'top_technologies_web', data: [] },
      { type: 'radar_domain_web', data: [] },
      { type: 'seniority_distribution_web', data: [] },
    ];

    (AnalyticsModel.find as jest.Mock).mockResolvedValue(mockAnalytics);

    const result = await AnalyticsService.getDomainDashboard('Web');

    expect(AnalyticsModel.find).toHaveBeenCalledWith({
      $or: [
        { type: 'top_cities_web' },
        { type: 'top_technologies_web' },
        { type: 'radar_domain_web' },
        { type: 'seniority_distribution_web' },
      ],
    });

    expect(result).toEqual({
      dashboard: 'domain',
      domain: 'Web',
      charts: mockAnalytics,
      total: 4,
    });
  });

  //invalid domain
  test('getDomainDashboard, invalid domain → throw error', async () => {
    await expect(AnalyticsService.getDomainDashboard('invalid-domain')).rejects.toThrow(
      'Invalid domain'
    );
  });

  //empty overview result
  test('getOverviewDashboard, empty result', async () => {
    (AnalyticsModel.find as jest.Mock).mockResolvedValue([]);

    const result = await AnalyticsService.getOverviewDashboard();

    expect(result).toEqual({
      dashboard: 'overview',
      charts: [],
      total: 0,
    });
  });
});

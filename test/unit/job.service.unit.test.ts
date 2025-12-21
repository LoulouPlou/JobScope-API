import { JobService } from '../../src/services/job.service';
import { JobModel } from '../../src/models/job.model';
import { UserModel } from '../../src/models/user.model';
import { FavoriteService } from '../../src/services/favorite.service';

jest.mock('../../src/models/job.model');
jest.mock('../../src/models/user.model');
jest.mock('../../src/services/favorite.service');

describe('JobService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // searchJobs()
  test('searchJobs , empty query (NO FILTERS)', async () => {
    (JobModel.find as jest.Mock).mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    (JobModel.countDocuments as jest.Mock).mockResolvedValue(0);

    const result = await JobService.searchJobs({});

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.pages).toBe(0);
  });

  test('searchJobs , with filters', async () => {
    const sortMock = jest.fn().mockResolvedValue([
      {
        _id: '1',
        title: 'Dev',
        company: 'ACME',
        location: 'MTL',
        jobType: 'Full-time',
        experience: 'Senior',
        description: 'desc',
        skills: [],
        publishedTime: new Date(),
      },
    ]);

    (JobModel.find as jest.Mock).mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: sortMock,
    });

    (JobModel.countDocuments as jest.Mock).mockResolvedValue(1);

    const result = await JobService.searchJobs({
      title: 'Dev',
      jobType: ['Full-time'],
      experience: ['Senior'],
    });

    expect(result.items.length).toBe(1);
    expect(result.total).toBe(1);
    expect(JobModel.find).toHaveBeenCalledWith({
      title: { $regex: 'Dev', $options: 'i' },
      jobType: { $in: ['Full-time'] },
      experience: { $in: ['Senior'] },
    });
  });

  // getPersonalizedJobs()
  test('getPersonalizedJobs , user NOT FOUND', async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    const limitMock = jest.fn().mockResolvedValue([
      {
        _id: '1',
        title: 'A',
        company: 'ACME',
        location: 'MTL',
        description: 'd',
        skills: [],
        publishedTime: new Date(),
      },
      {
        _id: '2',
        title: 'B',
        company: 'ACME',
        location: 'MTL',
        description: 'd',
        skills: [],
        publishedTime: new Date(),
      },
      {
        _id: '3',
        title: 'C',
        company: 'ACME',
        location: 'MTL',
        description: 'd',
        skills: [],
        publishedTime: new Date(),
      },
    ]);

    (JobModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: limitMock,
      }),
    });

    const result = await JobService.getPersonalizedJobs('1');
    expect(result.length).toBe(3);
  });

  test('getPersonalizedJobs , user WITHOUT interest', async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({});

    const limitMock = jest.fn().mockResolvedValue([
      {
        _id: '1',
        title: 'A',
        company: 'ACME',
        location: 'MTL',
        description: 'd',
        skills: [],
        publishedTime: new Date(),
      },
      {
        _id: '2',
        title: 'B',
        company: 'ACME',
        location: 'MTL',
        description: 'd',
        skills: [],
        publishedTime: new Date(),
      },
      {
        _id: '3',
        title: 'C',
        company: 'ACME',
        location: 'MTL',
        description: 'd',
        skills: [],
        publishedTime: new Date(),
      },
    ]);

    (JobModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: limitMock,
      }),
    });

    const result = await JobService.getPersonalizedJobs('1');
    expect(result.length).toBe(3);
  });

  test('getPersonalizedJobs , user WITH interest', async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({ interest: 'java' });

    const limitMock = jest.fn().mockResolvedValue([
      {
        _id: 'job-1',
        title: 'Java Dev',
        company: 'ACME',
        location: 'MTL',
        description: 'd',
        skills: [],
        publishedTime: new Date(),
      },
    ]);

    (JobModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: limitMock,
      }),
    });

    (FavoriteService.getUserFavoriteJobIds as jest.Mock).mockResolvedValue(new Set());

    const result = await JobService.getPersonalizedJobs('1');

    expect(result[0].title).toBe('Java Dev');
    expect(FavoriteService.getUserFavoriteJobIds).toHaveBeenCalledWith('1');
  });

  test('getJobById , success', async () => {
    const job = {
      _id: '1',
      title: 'Dev',
      company: 'ACME',
      location: 'MTL',
      description: 'd',
      skills: [],
      publishedTime: new Date(),
    };
    (JobModel.findById as jest.Mock).mockResolvedValue(job);

    const result = await JobService.getJobById('1');
    expect(JobModel.findById).toHaveBeenCalledWith('1');
    expect(result._id).toBe('1');
    expect(result.title).toBe('Dev');
  });

  test('getJobById , JOB_NOT_FOUND', async () => {
    (JobModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(JobService.getJobById('missing')).rejects.toMatchObject({
      code: 'JOB_NOT_FOUND',
      status: 404,
    });
  });

  test('getRecentJobs , returns latest 3 jobs', async () => {
    const limitFn = jest.fn().mockResolvedValue([
      {
        _id: '1',
        title: 'A',
        company: 'ACME',
        location: 'MTL',
        description: 'd',
        skills: [],
        publishedTime: new Date(),
      },
    ]);
    const sortFn = jest.fn().mockReturnValue({ limit: limitFn });
    (JobModel.find as jest.Mock).mockReturnValue({ sort: sortFn });

    const jobs = await JobService.getRecentJobs();

    expect(sortFn).toHaveBeenCalledWith({ publishedTime: -1 });
    expect(limitFn).toHaveBeenCalledWith(3);
    expect(jobs[0].title).toBe('A');
  });
});

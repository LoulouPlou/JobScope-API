import { UserModel } from '../models/user.model';
import { JobModel } from '../models/job.model';
import { FavoriteModel } from '../models/favorite.model';
import { AnalyticsModel } from '../models/analytics.model';

export async function seedDatabase() {
  try {
    // remove existing data
    await UserModel.deleteMany({});
    await JobModel.deleteMany({});
    await FavoriteModel.deleteMany({});

    // add users
    await UserModel.create({
      email: 'admin@jobportal.com',
      password: '$2a$10$A9IKcdwhfqNT7cMzh5C9ZOi1n4p/C4m3tTHTgkuabZZ0yFxcxZE7m',
      role: 'admin',
      firstName: 'Alice',
      lastName: 'Johnson',
    });

    const user = await UserModel.create({
      email: 'john.doe@email.com',
      password: '$2a$10$oeT0EyD47nb87FCXdqXcde8Wnhv/N56AcBvSN0bO.2EQG6/52Z6y2',
      role: 'user',
      firstName: 'John',
      lastName: 'Doe',
      biography:
        'Full-stack developer with 3 years of experience. Currently looking for new opportunities in web development and cloud technologies.',
      interest: 'Web',
    });

    // add jobs
    const jobs = await JobModel.create([
      {
        title: 'Senior Full-Stack Web Developer',
        company: 'Lightspeed Commerce',
        location: 'Toronto, ON',
        jobType: 'Full-time',
        experience: 'Mid',
        description: 'We are looking for a Full-Stack Web Developer to join our Marketing team...',
        skills: [
          'JavaScript',
          'React',
          'Node.js',
          'PHP',
          'MySQL',
          'WordPress',
          'Git',
          'REST',
          'HTML',
          'CSS',
        ],
        tags: ['JavaScript', 'React', 'Node.js'],
        postedOn: 'LinkedIn',
        publishedTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Senior DevOps Engineer',
        company: 'Munich Re',
        location: 'Toronto, ON',
        jobType: 'Full-time',
        experience: 'Senior',
        description: 'At Munich Re, the Integrated Analytics team leads innovation...',
        skills: [
          'Kubernetes',
          'Terraform',
          'AWS',
          'Azure',
          'Docker',
          'CI/CD',
          'Python',
          'Linux',
          'Prometheus',
          'Grafana',
        ],
        tags: ['Kubernetes', 'Terraform', 'AWS'],
        salary: '$69,000 - $114,000',
        postedOn: 'Indeed',
        publishedTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Junior Web Developer Co-Op',
        company: 'Osler, Hoskin & Harcourt LLP',
        location: 'Toronto, ON',
        jobType: 'Full-time',
        description: 'This Junior Web Developer position requires a good base of software...',
        skills: [
          'SharePoint',
          'SQL',
          'ASP.NET',
          'C#',
          'JavaScript',
          'React',
          'Node.js',
          'HTML',
          'CSS',
          'PowerShell',
        ],
        tags: ['SharePoint', 'SQL', 'JavaScript'],
        postedOn: 'Indeed',
        publishedTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Junior Web Developer - Cheil Canada',
        company: 'Cheil Dallas',
        description:
          'Cheil Canada Who are we? Cheil Canada is a full-service agency based out of Mississauga, Ontario ...',
        experience: 'Junior',
        jobType: 'Full-time',
        location: 'Mississauga, ON',
        postedOn: 'Indeed',
        skills: [
          'JavaScript',
          'Git',
          'Version control',
          'Photoshop',
          'Communication',
          'Attention to detail',
        ],
        tags: ['JavaScript', 'Git', 'Version control'],
        publishedTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ]);

    // add favorites
    await FavoriteModel.create([
      {
        userId: user._id,
        jobId: jobs[0]?._id,
      },
      {
        userId: user._id,
        jobId: jobs[1]?._id,
      },
    ]);

    await AnalyticsModel.create([
      {
        title: 'Job Types Distribution',
        type: 'job_type_distribution',
        chart_type: 'pie',
        data: [
          { label: 'Full-time', value: 944, percentage: 80.2 },
          { label: 'Contractor', value: 209, percentage: 17.8 },
          { label: 'Part-time', value: 19, percentage: 1.6 },
          { label: 'Internship', value: 5, percentage: 0.4 },
        ],
        metadata: {
          total_jobs: 1223,
          last_updated: new Date(),
        },
      },
      {
        type: 'radar_domain_web',
        chart_type: 'radar',
        data: [
          {
            category: 'Programming & Frameworks',
            mentions: 1319,
            percentage: 35.7,
            type: 'Hard Skill',
          },
          { category: 'DevOps & Cloud', mentions: 875, percentage: 23.7, type: 'Hard Skill' },
          { category: 'Data & Databases', mentions: 346, percentage: 9.4, type: 'Hard Skill' },
          { category: 'Design & UX', mentions: 49, percentage: 1.3, type: 'Hard Skill' },
          {
            category: 'Communication & Leadership',
            mentions: 606,
            percentage: 16.4,
            type: 'Soft Skill',
          },
          {
            category: 'Problem Solving & Teamwork',
            mentions: 499,
            percentage: 13.5,
            type: 'Soft Skill',
          },
        ],
        domain: 'Web',
        metadata: {
          total_categories: 6,
          total_mentions: 3694,
          last_updated: new Date(),
        },
        title: 'Skills Distribution - Web Domain',
      },
      {
        type: 'seniority_distribution_web',
        chart_type: 'donut',
        data: [
          { level: 'Junior', count: 10, percentage: 2 },
          { level: 'Mid', count: 240, percentage: 49 },
          { level: 'Senior', count: 213, percentage: 43.5 },
          { level: 'Lead', count: 27, percentage: 5.5 },
        ],
        domain: 'Web',
        metadata: {
          total_jobs: 490,
          last_updated: new Date(),
        },
        title: 'Seniority distribution for jobs offers in Web',
      },
      {
        type: 'radar_domain_devops',
        chart_type: 'radar',
        data: [
          {
            category: 'Programming & Frameworks',
            mentions: 460,
            percentage: 15.6,
            type: 'Hard Skill',
          },
          { category: 'DevOps & Cloud', mentions: 1411, percentage: 47.8, type: 'Hard Skill' },
          { category: 'Data & Databases', mentions: 146, percentage: 5, type: 'Hard Skill' },
          { category: 'Design & UX', mentions: 3, percentage: 0.1, type: 'Hard Skill' },
          {
            category: 'Communication & Leadership',
            mentions: 399,
            percentage: 13.5,
            type: 'Soft Skill',
          },
          {
            category: 'Problem Solving & Teamwork',
            mentions: 530,
            percentage: 18,
            type: 'Soft Skill',
          },
        ],
        domain: 'DevOps',
        metadata: {
          total_categories: 6,
          total_mentions: 2949,
          last_updated: new Date(),
        },
        title: 'Skills Distribution - DevOps Domain',
      },
      {
        type: 'seniority_distribution_devops',
        chart_type: 'donut',
        data: [
          { level: 'Junior', count: 6, percentage: 2 },
          { level: 'Mid', count: 146, percentage: 47.6 },
          { level: 'Senior', count: 146, percentage: 47.6 },
          { level: 'Lead', count: 9, percentage: 2.9 },
        ],
        domain: 'DevOps',
        metadata: {
          total_jobs: 307,
          last_updated: new Date(),
        },
        title: 'Seniority distribution for jobs offers in DevOps',
      },
    ]);
  } catch (error) {
    console.error('Seed database abort:', error);
    throw error;
  }
}

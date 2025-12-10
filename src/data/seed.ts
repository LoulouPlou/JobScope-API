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
      email: "admin@jobportal.com",
      password: "$2a$10$A9IKcdwhfqNT7cMzh5C9ZOi1n4p/C4m3tTHTgkuabZZ0yFxcxZE7m",
      role: "admin",
      firstName: "Alice",
      lastName: "Johnson"
    });

    const user = await UserModel.create({
      email: "john.doe@email.com",
      password: "$2a$10$oeT0EyD47nb87FCXdqXcde8Wnhv/N56AcBvSN0bO.2EQG6/52Z6y2",
      role: "user",
      firstName: "John",
      lastName: "Doe",
      biography: "Full-stack developer with 3 years of experience. Currently looking for new opportunities in web development and cloud technologies.",
      interest: "Web Development, Cloud Computing, DevOps"
    });

    // add jobs
    const jobs = await JobModel.create([{
      title: "Senior Full-Stack Web Developer",
      company: "Lightspeed Commerce",
      location: "Toronto, ON",
      jobType: "Full-time",
      experience: "5+ years",
      education: "Bachelor's degree in Computer Science",
      languages: ["English"],
      shortDescription: "Join our Marketing team to build, maintain, and evolve our marketing website and related applications.",
      description: "We are looking for a Full-Stack Web Developer to join our Marketing team...",
      skills: ["JavaScript", "React", "Node.js", "PHP", "MySQL", "WordPress", "Git", "REST", "HTML", "CSS"],
      tags: ["JavaScript", "React", "Node.js"],
      postedOn: "LinkedIn",
      publishedTime: "5 days ago"
    },
    {
      title: "Senior DevOps Engineer",
      company: "Munich Re",
      location: "Toronto, ON",
      jobType: "Full-time",
      experience: "5+ years",
      education: "Bachelor's degree in Computer Science or related field",
      languages: ["English"],
      shortDescription: "Design and implement highly available cloud infrastructure for business applications.",
      description: "At Munich Re, the Integrated Analytics team leads innovation...",
      skills: ["Kubernetes", "Terraform", "AWS", "Azure", "Docker", "CI/CD", "Python", "Linux", "Prometheus", "Grafana"],
      tags: ["Kubernetes", "Terraform", "AWS"],
      salary: "$69,000 - $114,000",
      postedOn: "Indeed",
      publishedTime: "18 days ago"
    }, {
      title: "Junior Web Developer Co-Op",
      company: "Osler, Hoskin & Harcourt LLP",
      location: "Toronto, ON",
      jobType: "Full-time",
      experience: "Not specified",
      education: "University degree in Computer or Engineering Sciences",
      languages: ["English"],
      shortDescription: "Join our team as a Junior Web Developer with focus on SharePoint/Microsoft 365 development.",
      description: "This Junior Web Developer position requires a good base of software...",
      skills: ["SharePoint", "SQL", "ASP.NET", "C#", "JavaScript", "React", "Node.js", "HTML", "CSS", "PowerShell"],
      tags: ["SharePoint", "SQL", "JavaScript"],
      postedOn: "Indeed",
      publishedTime: "4 days ago"
    }]);

    // add favorites
    await FavoriteModel.create([
      {
        userId: user._id,
        jobId: jobs[0]?._id
      },
      {
        userId: user._id,
        jobId: jobs[1]?._id
      }
    ]);

    await AnalyticsModel.create([
      {
        "title": "Job Types Distribution",
        "type": "job_type_distribution",
        "chart_type": "pie",
        "data": [
          { "label": "Full-time", "value": 944, "percentage": 80.2 },
          { "label": "Contractor", "value": 209, "percentage": 17.8 },
          { "label": "Part-time", "value": 19, "percentage": 1.6 },
          { "label": "Internship", "value": 5, "percentage": 0.4 }
        ],
        "metadata": {
          "total_jobs": 1223,
          "last_updated": {
            "$date": "2025-12-09T15:04:51.996Z"
          }
        }
      }
    ]);
  } catch (error) {
    console.error('Seed database abort:', error)
    throw error;
  }
}
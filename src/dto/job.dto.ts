export interface IJobInfo {
  _id: string;

  title: string;
  company: string;
  location: string;

  jobType?: string;
  tags?: [string, string, string];
  publishedTime?: string;

  isFavorite: boolean;
}

export interface IJobDetails {
  _id: string;

  title: string;
  company: string;
  location: string;

  jobType?: string;
  experience?: string;

  education: string;
  languages?: string[];

  description: string;

  skills: string[];
  tags?: [string, string, string];

  salary?: string;
  postedOn?: string;
  publishedTime?: string;

  isFavorite: boolean;
}
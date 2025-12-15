export interface IJobInfo {
  _id: string;

  title: string;
  company: string;
  location: string;

  jobType?: string;
  tags?: string[];
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

  description: string;

  skills: string[];
  tags?: string[];

  salary?: string;
  postedOn?: string;
  publishedTime?: string;

  isFavorite: boolean;
}
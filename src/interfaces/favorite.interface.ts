import { Types } from 'mongoose';

export interface IFavorite {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
  savedAt: Date;
}

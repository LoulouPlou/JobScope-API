import { Types } from "mongoose";

export interface IFavorite {
    _id?: Types.ObjectId;
    
    userId: Types.ObjectId;
    jobId: Types.ObjectId;
    savedAt: Date;
}
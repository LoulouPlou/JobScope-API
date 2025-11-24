import { Types } from "mongoose";

export interface IUser {
    _id?: Types.ObjectId;

    email: string;
    password: string;
    role: "user"|"admin";

    firstName?: string;
    lastName?: string;

    profilePicture?: string;
    biography?: string;
    interest?: string;
   
    createdAt: Date;
    updatedAt: Date;
}
import { IUser } from "../interfaces/user.interface";
import { UserModel } from "../models/user.model";


export class UserService {
    static async getUserByProfile(userId: string): Promise<IUser> {
        //This will tell MongoDb to get the user by the id but remove the password
        const user = await UserModel.findById(userId).select("-password");

        if (!user) {
            const error: any = new Error("User not found");
            error.status = 404;
            error.code = "USER_NOT_FOUND";
            throw error;
        }
        return {
            email: user.email,
            password: "",
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            biography: user.biography,
            interest: user.interest,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

    }

    //corrected code - check-up with someone
    static async putUserByProfile(userId: string, data: Partial<IUser> ): Promise<IUser> {
        //prevent the modification of sensitive attributes
        delete (data as any).email;
        delete (data as any).password;
        delete (data as any).role;

        const user = await UserModel.findByIdAndUpdate(userId, { $set: data },
            { new: true, runValidators: true }).select("-password");

        if (!user) {
            const error: any = new Error("User not found");
            error.status = 404;
            error.code = "USER_NOT_FOUND";
            throw error;
        }

        return {
            email: user.email,
            password: "",
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            biography: user.biography,
            interest: user.interest,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
}
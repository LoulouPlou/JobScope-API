import { IUser } from "../interfaces/user.interface";
import { UserModel } from "../models/user.model";

interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pages: number;
    limit: number;
}

export class adminService {

    static async getAllUsers(page: number = 1,limit: number = 5): Promise<PaginatedResponse<IUser>> {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            UserModel.find()
                .skip(skip)
                .limit(limit)
                .select("-password")
                .sort({ created_at: -1 }),
            UserModel.countDocuments()
        ]);
        return {
            items: users,
            total,
            page,
            pages: Math.ceil(total / limit),
            limit,
        };
    }

    static async infoUser(userId: string): Promise<IUser> {
        const user = await UserModel.findById(userId).select("-password");
        if (!user) {
            const error: any = new Error("User not found");
            error.status = 404;
            error.code = "USER_NOT_FOUND";
            throw error;
        }
        return user;
    }

    static async updateUser(userId: string,data: Partial<IUser>): Promise<IUser> {
        // Can be remove if you don't like to block password updates here
        if (data.password) {
            const error: any = new Error("Admin cannot modify passwords");
            error.status = 400;
            error.code = "PASSWORD_UPDATE_FORBIDDEN";
            throw error;
        }
        const updated = await UserModel.findByIdAndUpdate(userId,{ $set: data },{ new: true, runValidators: true }).select("-password");

        if (!updated) {
            const error: any = new Error("User not found");
            error.status = 404;
            error.code = "USER_NOT_FOUND";
            throw error;
        }

        return updated;
    }

    static async deleteUser(userId: string): Promise<void> {
        const result = await UserModel.findByIdAndDelete(userId);
        if (!result) {
            const error: any = new Error("User not found");
            error.status = 404;
            error.code = "USER_NOT_FOUND";
            throw error;
        }
    }
}

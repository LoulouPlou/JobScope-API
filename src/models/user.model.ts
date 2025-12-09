import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../interfaces/user.interface";
//https://www.slingacademy.com/article/how-to-validate-strings-in-mongoose/
const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            match: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        firstName: {
            type: String,
            trim: true,
        },

        lastName: {
            type: String,
            trim: true,
        },

        profilePicture: {
            type: String, //5MB check the backend
        },

        biography: {
            type: String,
            maxlength: 500,
            validate: {
                validator: function (v: string) {
                    //reject all HTML tags
                    return !/<.*?>/g.test(v);
                },
                message: props => `The biography contains forbidden HTML or script content: "${props.value}"`

            }
        },
        
        interest: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    }
);

// Index
userSchema.index({ email: 1 },{ unique: true });

export const UserModel: Model<IUser> = mongoose.model<IUser>(
    "User",
    userSchema
);

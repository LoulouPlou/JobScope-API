import mongoose, { Schema, Model } from "mongoose";
import { IFavorite } from "../interfaces/favorite.interface";

const favoriteSchema = new Schema<IFavorite>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        jobId: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },

        savedAt: {
            type: Date,
            default: Date.now,
        },
    },

);

// Prevent duplicate favorites
favoriteSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const FavoriteModel: Model<IFavorite> = mongoose.model<IFavorite>(
    "Favorite",
    favoriteSchema
);

import mongoose, { Schema, Model } from "mongoose";
import { IAnalytics } from "../interfaces/analytics.interface";

const analyticsSchema = new Schema<IAnalytics>({
  type: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  chart_type: {
    type: String,
    required: true,
    enum: ['pie', 'bar', 'horizontal_bar', 'donut', 'radar']
  },
  domain: {
    type: String,
    index: true
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: true
  }
});

analyticsSchema.index({ type: 1, domain: 1 });

export const AnalyticsModel : Model<IAnalytics> = mongoose.model<IAnalytics>(
    "Analytics",
    analyticsSchema
);
import { DashboardHistoryItem, IDashboard } from "../types/dashboardType";
import mongoose from "mongoose";

const { Schema } = mongoose;

const DashboardLayoutItemSchema = new Schema(
  {
    i: { type: String, required: true },
    widgetId: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    minW: { type: Number },
    minH: { type: Number },
    maxW: { type: Number },
    maxH: { type: Number },
    static: { type: Boolean },
  },
  { _id: false }
);

const DashboardHistoryItemSchema = new Schema<DashboardHistoryItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    action: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },
    changes: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const DashboardTimeRangeSchema = new Schema(
  {
    from: { type: Date },
    to: { type: Date },
    intervalValue: { type: Number },
    intervalUnit: { type: String },
  },
  { _id: false }
);

const DashboardSchema = new Schema(
  {
    title: { type: String, required: true },
    layout: { type: [DashboardLayoutItemSchema], default: [] },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    history: { type: [DashboardHistoryItemSchema], default: [] },
    shareEnabled: { type: Boolean, default: false },
    shareId: {
      type: String,
      default: null,
    },
    autoRefreshIntervalValue: { type: Number },
    autoRefreshIntervalUnit: { type: String },
    timeRange: { type: DashboardTimeRangeSchema, default: undefined },
  },
  { timestamps: true }
);

export default mongoose.model<IDashboard>("Dashboard", DashboardSchema);

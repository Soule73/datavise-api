import { IDataSource } from "../types/sourceType";
import mongoose, { Schema } from "mongoose";

const DataSourceSchema = new Schema<IDataSource>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["json", "csv", "elasticsearch"],
      default: "json",
    },
    endpoint: { type: String, required: false },
    filePath: { type: String },
    config: { type: Schema.Types.Mixed, default: {} },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    timestampField: { type: String },
    httpMethod: { type: String, enum: ["GET", "POST"], default: "GET" },
    authType: {
      type: String,
      enum: ["none", "bearer", "apiKey", "basic"],
      default: "none",
    },
    authConfig: { type: Schema.Types.Mixed, default: {} },
    esIndex: { type: String },
    esQuery: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IDataSource>("DataSource", DataSourceSchema);

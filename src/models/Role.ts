import { IRole } from "../types/authType";
import mongoose, { Schema } from "mongoose";

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: [
    { type: Schema.Types.ObjectId, ref: "Permission", required: true },
  ],
});

export default mongoose.model<IRole>("Role", RoleSchema);

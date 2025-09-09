import { IUser } from "../types/authType";
import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    preferences: { type: Schema.Types.Mixed, default: {} },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);

import { IWidget, WidgetHistoryItem } from "../types/widgetType";
import mongoose, { Schema } from "mongoose";

const WidgetHistoryItemSchema = new Schema<WidgetHistoryItem>(
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

const WidgetSchema = new Schema<IWidget>(
  {
    widgetId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    dataSourceId: {
      type: Schema.Types.ObjectId,
      ref: "DataSource",
      required: true,
    },
    config: { type: Schema.Types.Mixed, default: {} },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    history: { type: [WidgetHistoryItemSchema], default: [] },

    // Champs pour les widgets générés par l'IA
    isGeneratedByAI: { type: Boolean, default: false },
    conversationId: { type: Schema.Types.ObjectId, ref: "AIConversation" },
    isDraft: { type: Boolean, default: false },
    description: { type: String },
    reasoning: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
  },
  { timestamps: true }
);

export default mongoose.model<IWidget>("Widget", WidgetSchema);

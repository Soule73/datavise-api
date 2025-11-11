import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAIMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    widgetsGenerated?: number;
}

export interface IAIConversation extends Document {
    userId: Types.ObjectId;
    dataSourceId: Types.ObjectId;
    title: string;
    messages: IAIMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const AIMessageSchema = new Schema<IAIMessage>(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        widgetsGenerated: {
            type: Number,
            required: false,
        },
    },
    { _id: false }
);

const AIConversationSchema = new Schema<IAIConversation>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        dataSourceId: {
            type: Schema.Types.ObjectId,
            ref: "DataSource",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        messages: {
            type: [AIMessageSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

AIConversationSchema.index({ userId: 1, createdAt: -1 });
AIConversationSchema.index({ userId: 1, dataSourceId: 1 });

const AIConversation = mongoose.model<IAIConversation>(
    "AIConversation",
    AIConversationSchema
);

export default AIConversation;

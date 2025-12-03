import mongoose from "mongoose";
import { IWidget } from "../types/widgetType";

export interface DashboardLayoutItem {
  i: string;
  widgetId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  widget?: IWidget;
}

export interface DashboardHistoryItem {
  userId: mongoose.Types.ObjectId;
  date: Date;
  action: "create" | "update" | "delete";
  changes?: Record<string, unknown>;
}

export interface IDashboard extends mongoose.Document {
  title: string;
  layout: DashboardLayoutItem[];
  ownerId: mongoose.Types.ObjectId;
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
  history?: DashboardHistoryItem[];
  shareEnabled: boolean;
  shareId: string | null;
  widgets?: IWidget[];
}

export interface DashboardBasePayload {
  title?: string;
  layout?: DashboardLayoutItem[];
  autoRefreshIntervalValue?: number;
  autoRefreshIntervalUnit?: string;
  timeRange?: unknown;
  visibility?: "public" | "private";
  [key: string]: unknown;
}

export interface DashboardCreatePayload extends DashboardBasePayload {
  title: string;
  layout: DashboardLayoutItem[];
  ownerId: mongoose.Types.ObjectId;
  visibility: "public" | "private";
}

export type DashboardUpdatePayload = Partial<DashboardBasePayload>;

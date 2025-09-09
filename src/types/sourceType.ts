import mongoose from "mongoose";

export type AuthType = "none" | "basic" | "bearer" | "apiKey"
export type HttpMethod = "GET" | "POST"
export type DataSourceType = "json" | "csv" | "elasticsearch"
export type DataSourceVisibility = "public" | "private"
export type CacheParams = { key: string, ttl: number }

export interface AuthConfig {
  token?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  headerName?: string;
}

export interface DataSourceBasePayload {
  name: string;
  type: DataSourceType;
  endpoint?: string;
  config?: Record<string, unknown>;
  visibility: DataSourceVisibility;
  timestampField?: string;
  httpMethod?: HttpMethod;
  authType?: AuthType;
  authConfig?: AuthConfig;
  esIndex?: string;
  esQuery?: any;
}

export interface IDataSource extends Document, DataSourceBasePayload {
  _id: mongoose.Types.ObjectId;
  filePath?: string;
  ownerId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  isUsed?: boolean;
}

export interface DataSourceCreatePayload extends DataSourceBasePayload {
  file?: File | null;
  filePath?: string;
  ownerId?: mongoose.Types.ObjectId;
}

export interface FetchOptions {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  fields?: string;
  forceRefresh?: boolean;
  shareId?: string;
}

export interface DetectParams extends Omit<DataSourceCreatePayload, "name" | "visibility" | "ownerId"> {
  sourceId?: string
}

export interface EsConfig {
  endpoint: string | undefined;
  authType?: AuthType;
  authConfig?: AuthConfig;
}

export interface FetchSourceResponse {
  data: Record<string, any>;
  total: number;
}

export type DataSourceUpdatePayload = Partial<DataSourceCreatePayload>;

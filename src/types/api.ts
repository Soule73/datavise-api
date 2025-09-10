export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
  status?: number;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiData<T> {
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  error: null;
};

export type ApiFailure = {
  success: false;
  data: null;
  error: ApiErrorBody;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

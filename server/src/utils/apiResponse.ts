export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export function createApiResponse<T>(message: string, data?: T): ApiResponse<T> {
  return {
    success: true,
    message,
    data: data ?? null,
  };
}

// Error handler utility for API calls

export interface ApiError {
  status?: number;
  message: string;
  data?: any;
  originalError?: any;
}

export class ApiErrorHandler {
  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: ApiError): string {
    // Network errors
    if (!error.status) {
      return "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
    }

    // HTTP status codes
    switch (error.status) {
      case 400:
        return error.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
      case 401:
        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      case 403:
        return "Bạn không có quyền thực hiện thao tác này.";
      case 404:
        return error.message || "Không tìm thấy dữ liệu.";
      case 409:
        return error.message || "Dữ liệu đã tồn tại.";
      case 422:
        return error.message || "Dữ liệu không hợp lệ.";
      case 429:
        return "Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau.";
      case 500:
        return "Lỗi server. Vui lòng thử lại sau.";
      case 503:
        return "Server đang bảo trì. Vui lòng thử lại sau.";
      default:
        return error.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
    }
  }

  /**
   * Log error for debugging
   */
  static logError(error: ApiError, context?: string): void {
    console.error(`[API Error${context ? ` - ${context}` : ''}]`, {
      status: error.status,
      message: error.message,
      data: error.data,
    });
  }

  /**
   * Handle error with logging and user message
   */
  static handle(error: ApiError, context?: string): string {
    this.logError(error, context);
    return this.getUserMessage(error);
  }

  /**
   * Check if error is network error
   */
  static isNetworkError(error: ApiError): boolean {
    return !error.status;
  }

  /**
   * Check if error is authentication error
   */
  static isAuthError(error: ApiError): boolean {
    return error.status === 401;
  }

  /**
   * Check if error is validation error
   */
  static isValidationError(error: ApiError): boolean {
    return error.status === 400 || error.status === 422;
  }
}

/**
 * Hook for handling API errors in components
 */
export const useApiError = () => {
  const handleError = (error: any, context?: string): string => {
    const apiError: ApiError = {
      status: error?.status,
      message: error?.message || "Unknown error",
      data: error?.data,
      originalError: error,
    };

    return ApiErrorHandler.handle(apiError, context);
  };

  return { handleError };
};

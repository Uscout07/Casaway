// Utility functions for error handling

export const ErrorTypes = {
  NOT_FOUND: '404',
  SERVER_ERROR: '500',
  UNAUTHORIZED: '403',
  NETWORK_ERROR: 'network',
  GENERAL: 'general'
} as const;

export type ErrorType = typeof ErrorTypes[keyof typeof ErrorTypes];

export interface ErrorConfig {
  title?: string;
  message?: string;
  errorCode?: string | number;
  showBackButton?: boolean;
  backButtonText?: string;
  icon?: string;
}

export const getErrorConfig = (type: ErrorType): ErrorConfig => {
  switch (type) {
    case ErrorTypes.NOT_FOUND:
      return {
        title: "Page Not Found",
        message: "The page you're looking for doesn't exist or has been moved.",
        errorCode: "404",
        icon: "material-symbols:search-off"
      };
    
    case ErrorTypes.SERVER_ERROR:
      return {
        title: "Server Error",
        message: "Our servers are experiencing some issues. Please try again in a few moments.",
        errorCode: "500",
        icon: "material-symbols:cloud-off"
      };
    
    case ErrorTypes.UNAUTHORIZED:
      return {
        title: "Access Denied",
        message: "You don't have permission to access this page. Please log in or contact support.",
        errorCode: "403",
        icon: "material-symbols:lock"
      };
    
    case ErrorTypes.NETWORK_ERROR:
      return {
        title: "Connection Error",
        message: "Unable to connect to our servers. Please check your internet connection and try again.",
        errorCode: "Network Error",
        icon: "material-symbols:wifi-off"
      };
    
    default:
      return {
        title: "Oops! Something went wrong",
        message: "We're sorry, but something unexpected happened. Please try again later.",
        icon: "material-symbols:error-outline"
      };
  }
};

// Helper function to create error objects
export const createError = (type: ErrorType, customConfig?: Partial<ErrorConfig>) => {
  return {
    ...getErrorConfig(type),
    ...customConfig
  };
};

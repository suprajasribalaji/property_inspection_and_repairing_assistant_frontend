import { useNavigate } from 'react-router-dom';

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  status?: number;
  message?: string;
  request?: unknown;
}

export const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = (error: ApiError) => {
    const statusCode = error.response?.status || error.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

    // Navigate to error page with status code and message
    navigate('/error', {
      state: {
        errorCode: statusCode,
        errorMessage: errorMessage
      }
    });
  };

  const handleApiError = (error: ApiError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      handleError(error);
    } else if (error.request) {
      // The request was made but no response was received
      navigate('/error', {
        state: {
          errorCode: 0, // Network error
          errorMessage: 'Network error. Please check your connection.'
        }
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      navigate('/error', {
        state: {
          errorCode: 500,
          errorMessage: error.message || 'An unexpected error occurred.'
        }
      });
    }
  };

  return { handleError, handleApiError };
};

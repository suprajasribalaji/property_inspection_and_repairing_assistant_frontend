import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

interface ErrorBoundaryProps {
  errorCode?: number | string;
  errorMessage?: string;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  errorCode,
  errorMessage
}) => {
  const navigate = useNavigate();

  const getErrorConfig = (code: number | string) => {
    const statusCode = typeof code === 'string' ? parseInt(code) : code;

    switch (statusCode) {
      case 403:
      case 429:
        return {
          status: "403" as const,
          title: "API Quota Exceeded",
          subTitle: errorMessage || "API quota exceeded. Please try again later or upgrade to a paid plan.",
        };
      case 404:
        return {
          status: "404" as const,
          title: "404",
          subTitle: errorMessage || "Sorry, the page you visited does not exist.",
        };
      case 500:
        return {
          status: "500" as const,
          title: "500",
          subTitle: errorMessage || "Sorry, something went wrong.",
        };
      default:
        return {
          status: "error" as const,
          title: "Error",
          subTitle: errorMessage || "An unexpected error occurred.",
        };
    }
  };

  const errorConfig = errorCode ? getErrorConfig(errorCode) : getErrorConfig(500);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl px-4">
        <Result
          status={errorConfig.status}
          title={errorConfig.title}
          subTitle={errorConfig.subTitle}
          extra={
            <Button
              type="primary"
              onClick={() => navigate('/home')}
              className="border-0 h-12 px-8 text-base font-semibold shadow-elevated hover:shadow-lg transition-all duration-200"
              style={{
                background: '#6E5B9A',
              }}
            >
              Home Page
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default ErrorBoundary;

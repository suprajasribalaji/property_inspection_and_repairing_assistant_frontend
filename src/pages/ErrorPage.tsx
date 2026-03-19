import React from 'react';
import { useLocation } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';

const ErrorPage: React.FC = () => {
  const location = useLocation();
  
  // Get error code from location state or query params
  const errorCode = location.state?.errorCode || 
                   new URLSearchParams(location.search).get('code');
  const errorMessage = location.state?.errorMessage || 
                      new URLSearchParams(location.search).get('message');

  return (
    <ErrorBoundary 
      errorCode={errorCode} 
      errorMessage={errorMessage} 
    />
  );
};

export default ErrorPage;
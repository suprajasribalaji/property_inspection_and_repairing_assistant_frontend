import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

const ServerErrorPage = () => {
  return <ErrorBoundary errorCode={500} />;
};

export default ServerErrorPage;

import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

const ForbiddenPage = () => {
  return <ErrorBoundary errorCode={403} />;
};

export default ForbiddenPage;

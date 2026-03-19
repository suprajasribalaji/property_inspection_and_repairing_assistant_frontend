import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

const NotFoundPage = () => {
  return <ErrorBoundary errorCode={404} />;
};

export default NotFoundPage;

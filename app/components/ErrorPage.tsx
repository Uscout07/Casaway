'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';

interface ErrorPageProps {
  title?: string;
  message?: string;
  errorCode?: string | number;
  showBackButton?: boolean;
  backButtonText?: string;
  icon?: string;
  className?: string;
}

export default function ErrorPage({
  title = "Oops! Something went wrong",
  message = "We're sorry, but something unexpected happened. Please try again later.",
  errorCode,
  showBackButton = true,
  backButtonText = "Go Back",
  icon = "material-symbols:error-outline",
  className = ""
}: ErrorPageProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 ${className}`}>
      <div className="max-w-md w-full">
        {/* Back Button */}
        {showBackButton && (
          <button
            onClick={handleGoBack}
            className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 group"
          >
            <Icon 
              icon="material-symbols:arrow-back" 
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" 
            />
            <span className="text-sm font-medium">{backButtonText}</span>
          </button>
        )}

        {/* Error Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <Icon 
                  icon={icon} 
                  className="w-10 h-10 text-red-500" 
                />
              </div>
              {/* Animated pulse ring */}
              <div className="absolute inset-0 w-20 h-20 bg-red-100 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Error Code */}
          {errorCode && (
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-mono rounded-full">
                {errorCode}
              </span>
            </div>
          )}

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-forest text-white rounded-lg hover:bg-forest-dark transition-colors duration-200 font-medium"
            >
              <Icon icon="material-symbols:arrow-back" className="w-4 h-4" />
              Go Back
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              <Icon icon="material-symbols:home" className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-red-300 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// Predefined error page variants
export function NotFoundPage() {
  return (
    <ErrorPage
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      errorCode="404"
      icon="material-symbols:search-off"
    />
  );
}

export function ServerErrorPage() {
  return (
    <ErrorPage
      title="Server Error"
      message="Our servers are experiencing some issues. Please try again in a few moments."
      errorCode="500"
      icon="material-symbols:cloud-off"
    />
  );
}

export function UnauthorizedPage() {
  return (
    <ErrorPage
      title="Access Denied"
      message="You don't have permission to access this page. Please log in or contact support."
      errorCode="403"
      icon="material-symbols:lock"
    />
  );
}

export function NetworkErrorPage() {
  return (
    <ErrorPage
      title="Connection Error"
      message="Unable to connect to our servers. Please check your internet connection and try again."
      errorCode="Network Error"
      icon="material-symbols:wifi-off"
    />
  );
}

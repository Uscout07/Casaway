'use client';

import React, { useState } from 'react';
import ErrorPage, { 
  NotFoundPage, 
  ServerErrorPage, 
  UnauthorizedPage, 
  NetworkErrorPage 
} from '../components/ErrorPage';

export default function CustomErrorPage() {
  const [selectedError, setSelectedError] = useState('general');

  const errorTypes = [
    { id: 'general', label: 'General Error', component: ErrorPage },
    { id: '404', label: 'Not Found', component: NotFoundPage },
    { id: '500', label: 'Server Error', component: ServerErrorPage },
    { id: '403', label: 'Unauthorized', component: UnauthorizedPage },
    { id: 'network', label: 'Network Error', component: NetworkErrorPage },
  ];

  const SelectedComponent = errorTypes.find(type => type.id === selectedError)?.component || ErrorPage;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Type Selector */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Error Page Preview</h2>
          <div className="flex flex-wrap gap-2">
            {errorTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedError(type.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedError === type.id
                    ? 'bg-forest text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Page Display */}
      <SelectedComponent />
    </div>
  );
}

// app/components/ProfileErrorDisplay.tsx
import React from 'react';
import { Icon } from '@iconify/react';

interface ProfileErrorDisplayProps {
    errorMessage: string;
    onRetry: () => void;
}

const ProfileErrorDisplay: React.FC<ProfileErrorDisplayProps> = ({ errorMessage, onRetry }) => {
    return (
        <div className="min-h-screen flex items-center justify-center text-center bg-ambient w-full">
            <div className="text-red-600">
                <Icon icon="material-symbols:error-outline" className="w-12 h-12 mb-4 mx-auto" />
                <p className="text-lg font-semibold mb-2">Error Loading Profile</p>
                <p>{errorMessage}</p>
                <button
                    onClick={onRetry}
                    className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
};

export default ProfileErrorDisplay;
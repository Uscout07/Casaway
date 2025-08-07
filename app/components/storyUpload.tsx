'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import axios from 'axios';
// Using a placeholder Icon wrapper for compilation
type IconProps = {
  icon: string;
  className?: string;
};
const IconWrapper: React.FC<IconProps> = ({ icon, className }) => {
    return (
        <span className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            {icon.includes('upload') && '⬆️'}
            {icon.includes('check') && '✔️'}
            {/* Add more as needed based on your icon usage */}
        </span>
    );
};


interface User {
  _id: string;
  name: string;
  username: string;
  profilePic?: string;
}

export default function StoryUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // State for error messages

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    if (!storedToken) {
      console.warn('No token found, user not authenticated.');
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_BASE_URL) {
      console.error('NEXT_PUBLIC_API_URL is not defined.');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        if (!res.ok) {
          console.error('Failed to fetch user:', res.statusText);
          return;
        }

        const data = await res.json();
        setUser({
          ...data,
          _id: data._id?.toString() || data.id?.toString() || '',
        });
      } catch (err) {
        console.error('User fetch error', err);
      }
    };

    fetchUser();
  }, []);

  const handleUpload = async () => {
    setError(null); // Clear previous errors
    if (!file) {
      setError('Please select a file to upload for your story.');
      return;
    }
    if (!token) {
      setError('You need to be logged in to upload a story.');
      return;
    }

    const formData = new FormData();
    formData.append('media', file);
    formData.append('caption', caption);

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/stories`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });

      if (response.status === 201) {
        console.log('Story uploaded successfully!', response.data);
        // Using console.log instead of alert
        // alert('Story uploaded!');
        setFile(null);
        setCaption('');
        setError(null); // Clear error on success
        // Optionally redirect or show a success message
        // window.location.href = '/feed'; // Example redirection
      } else {
        console.error('Story upload failed:', response.data);
        setError(response.data.message || 'Story upload failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Upload failed:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Upload failed. Network error or server issue.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-500">
        Please log in to upload a story.
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto bg-ambient rounded-xl px-4 py-6 sm:px-6 space-y-6 flex max-md:flex-col items-center md:items-start justify-evenly">

      {/* Media Upload Section */}
      <div className="bg-white w-[300px] md:w-[400px] aspect-square rounded-lg p-6 flex flex-col items-center justify-center text-center relative border-2 border-dashed border-forest-medium hover:border-forest-green transition-colors cursor-pointer">
        <Icon icon="material-symbols:upload-rounded" className="w-16 h-16 text-forest-medium mx-auto mb-4" />
        <p className="text-gray-600 mb-4">
          {file ? `Selected: ${file.name}` : 'Drag & Drop or Click to Upload Images or Videos for Your Story'}
        </p>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setError(null); // Clear error when a file is selected
          }}
          className="hidden"
          id="story-media-upload"
        />
        <label
          htmlFor="story-media-upload"
          className="absolute inset-0 z-10 cursor-pointer"
        >
        </label>
        {file && (
            <div className="mt-2 text-xs text-gray-500">
                File size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
        )}
      </div>

      {/* Caption Input */}
      <div className='w-full md:w-1/2'>
        <label htmlFor="story-caption" className="block text-sm font-medium text-gray-800 mb-2">
          Caption (Optional)
        </label>
        <textarea
          id="story-caption"
          rows={3}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full p-3 border-2 border-forest-light bg-ambient rounded-lg focus:ring-2 focus:ring-forest-green focus:border-forest-green text-forest resize-none text-sm"
          placeholder="Add a caption to your story..."
        />
         <div className="pt-2">
        <button
          onClick={handleUpload}
          disabled={loading || !file} // Disable if no file is selected
          className="w-full bg-forest text-white py-3 rounded-lg font-medium hover:bg-forest-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : 'Upload Story'}
        </button>
      </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

      {/* Action Button */}
     
    </div>
  );
}
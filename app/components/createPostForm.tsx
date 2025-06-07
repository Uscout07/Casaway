// components/CreatePostForm.tsx
'use client';
import React, { useState } from 'react';
import { Icon } from '@iconify/react';

type CreatePostFormProps = {
  onPostCreated: () => void;
};

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [countryInput, setCountryInput] = useState('India');
  const [cityInput, setCityInput] = useState('Asoda Todran');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image upload state (matching page.tsx)
  const [selectedImages, setSelectedImages] = useState<any[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);
    if (selectedImages.length + files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file: file,
          url: e.target?.result as string,
          name: file.name
        };
        setSelectedImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId: number) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmitPost = async (status: 'draft' | 'published') => {
    setIsLoading(true);
    setError(null);

    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    // Convert images to URLs (first image as main imageUrl)
    const imageUrls = selectedImages.map(img => img.url);

    const postData = {
      caption,
      tags: tagsArray,
      city: cityInput,
      country: countryInput,
      imageUrl: imageUrls[0] || '', // Main image
      images: imageUrls, // All images
      status // Add status field
    };

    // Validation
    if (!imageUrls[0]) {
      setError('At least one image is required for the post.');
      setIsLoading(false);
      return;
    }
    if (!caption.trim()) {
      setError('Caption is required for the post.');
      setIsLoading(false);
      return;
    }
    if (!countryInput.trim()) {
      setError('Country is required.');
      setIsLoading(false);
      return;
    }
    if (!cityInput.trim()) {
      setError('City is required.');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Post created successfully:', result);
        alert(`Post ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
        
        // Clear form fields on success
        setCaption('');
        setTagsInput('');
        setSelectedImages([]);
        onPostCreated();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to create post');
      }
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Error creating post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-row justify-evenly">
      {/* Left side - Image Upload */}
      <div className="p-4 w-1/3 flex flex-col space-y-6">
        {/* Image Upload Section */}
        <div className="bg-white min-w-[460px] min-h-[340px] rounded-lg p-6 flex flex-col items-center justify-center text-center mb-4">
          <Icon icon="material-symbols:upload-rounded" className="w-16 h-16 text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Upload Images for Your Post</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="post-image-upload"
          />
          <label
            htmlFor="post-image-upload"
            className="w-[460px] h-[340px] absolute z-20 opacity-0 cursor-pointer"
          >
            Choose Images
          </label>
        </div>

        {/* Selected Images Display */}
        {selectedImages.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-3">Selected Images ({selectedImages.length}/10):</p>
            <div className="grid grid-cols-3 gap-3">
              {selectedImages.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Icon icon="mdi:close" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right side - Form */}
      <div className="px-4 pb-4 pt-0 w-1/2 space-y-6">
        <div className="bg-ambient rounded-lg px-6 pt-0 space-y-4">

          {/* Country Input */}
          <div>
            <label htmlFor="post-country" className="block text-sm font-medium text-gray-800 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              id="post-country"
              type="text"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              className="w-full p-3 border-2 border-forest bg-forest-light rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-forest"
              placeholder="e.g., India"
              required
            />
          </div>

          {/* City Input */}
          <div>
            <label htmlFor="post-city" className="block text-sm font-medium text-gray-800 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              id="post-city"
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full p-3 border-2 border-forest bg-forest-light rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-forest"
              placeholder="e.g., Asoda Todran"
              required
            />
          </div>

          {/* Caption Input */}
          <div>
            <label htmlFor="post-caption" className="block text-sm font-medium text-gray-800 mb-2">
              Caption <span className="text-red-500">*</span>
            </label>
            <textarea
              id="post-caption"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3 border-2 border-forest bg-forest-light rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-forest resize-none"
              placeholder="Write your post caption here..."
              required
            />
          </div>

          {/* Tags Input */}
          <div>
            <label htmlFor="post-tags" className="block text-sm font-medium text-gray-800 mb-2">
              Tags (comma-separated)
            </label>
            <input
              id="post-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full p-3 border-2 border-forest bg-forest-light rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-forest"
              placeholder="e.g., travel, adventure, homestay"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={() => handleSubmitPost('draft')}
              disabled={isLoading}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save As Draft'}
            </button>

            <button
              onClick={() => handleSubmitPost('published')}
              disabled={isLoading || !selectedImages.length || !caption.trim() || !countryInput.trim() || !cityInput.trim()}
              className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;
'use client';
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

// Define a type for images that includes a URL
interface ImageWithUrl extends File {
  url?: string; // Add optional url property for simulated/actual uploaded URL
}

type CreatePostFormProps = {
    onPostCreated: () => void;
    initialImageUrl?: string; // Made optional as it might not always be there
    initialCountry?: string;
    initialCity?: string;
};


const CreatePostForm: React.FC<CreatePostFormProps> = ({
  onPostCreated,
  initialCountry = 'India',
  initialCity = 'Asoda Todran',
}) => {
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [countryInput, setCountryInput] = useState(initialCountry);
  const [cityInput, setCityInput] = useState(initialCity);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<ImageWithUrl[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);
    if (selectedImages.length + files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    const newPreviewUrls: string[] = [];
    const newSelectedImages: ImageWithUrl[] = [];

    files.forEach(file => {
      newPreviewUrls.push(URL.createObjectURL(file));

      // --- IMPORTANT: This is where you would upload the file to a cloud service ---
      // For now, we'll just add a placeholder URL to the file object for demonstration.
      // In a real application, you would:
      // 1. Call your image upload API (e.g., fetch('/api/upload-image', { method: 'POST', body: formData }))
      // 2. Await the response to get the actual cloud URL.
      // 3. Assign the URL: (file as ImageWithUrl).url = actualCloudUrl;
      const simulatedUrl = `http://example.com/uploaded/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      newSelectedImages.push({ ...file, url: simulatedUrl }); // Attach a dummy URL
    });

    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setSelectedImages(prev => [...prev, ...newSelectedImages]);
  };

  const handleRemoveImage = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitPost = async (status: 'draft' | 'published') => {
    setIsLoading(true);
    setError(null);

    // Validate inputs
    if (!caption.trim() || !countryInput.trim() || !cityInput.trim()) {
      setError('Please fill in all required fields (Caption, City, Country).');
      setIsLoading(false);
      return;
    }
    if (!selectedImages.length) {
      setError('Please upload at least one image.');
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('token'); // Retrieve token from local storage (or cookie)
    if (!token) {
        setError('User not logged in. Please log in to create a post.');
        setIsLoading(false);
        return;
    }

    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);

    // Prepare data to send as JSON, including image URLs
    const postData = {
      caption: caption,
      city: cityInput,
      country: countryInput,
      status: status,
      tags: tagsArray,
      imageUrl: selectedImages[0]?.url || '', // Main image URL
      images: selectedImages.map(image => image.url).filter(Boolean), // Array of all image URLs
    };

    console.log('Sending post data (JSON):', postData); // Log the data being sent

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Explicitly set Content-Type for JSON
          'Authorization': `Bearer ${token}`, // <-- ADDED: Send the JWT token
        },
        body: JSON.stringify(postData), // Send JSON string
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || response.statusText || 'Failed to create post');
      }

      const data = await response.json();
      console.log('Post created successfully:', data);
      onPostCreated(); // Callback to parent to close form or update list
      setCaption('');
      setTagsInput('');
      setSelectedImages([]);
      setPreviewUrls([]);
      setError(null);
    } catch (err: any) {
      console.error('Error creating post:', err.message);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto bg-ambient rounded-xl px-4 py-6 sm:px-6 space-y-6 flex max-md:flex-col items-center md:items-start justify-evenly">
      {/* Left side - Image Upload */}
      <div className="w-full flex flex-col">
        <div className="bg-white w-[300px] md:w-[400px] aspect-square rounded-lg p-6 flex flex-col items-center justify-center text-center relative border-2 border-dashed border-forest-medium hover:border-forest-green transition-colors cursor-pointer">
          <Icon icon="material-symbols:upload-rounded" className="w-16 h-16 text-forest-medium mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Drag & Drop or Click to Upload Images (Max 10)</p>
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
            className="absolute top-0 left-0 w-full h-full z-10 cursor-pointer"
          >
            <span className="sr-only">Choose Images</span>
          </label>
        </div>

        {previewUrls.length > 0 && (
          <div className="mt-6"> {/* Added margin-top here */}
            <p className="text-sm text-gray-600 mb-3">Selected Images ({previewUrls.length}/10):</p>
            <div className="grid grid-cols-3 gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`preview-${index}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)} // Changed to handleRemoveImage
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Icon icon="mdi:close" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && error.includes('image') && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Right side - Form */}
      <div className="w-full max-w-[800px] space-y-6">
        <div className="bg-ambient rounded-lg px-4 pb-6 sm:px-6 space-y-4 w-full">
          {/* Country Input */}
          <div className="w-full">
            <label htmlFor="post-country" className="block text-sm font-medium text-gray-800 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              id="post-country"
              type="text"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              className="w-full p-3 border-2 border-forest-light bg-ambient rounded-lg focus:ring-2 focus:ring-forest-green focus:border-forest-green text-forest"
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
              className="w-full p-3 border-2 border-forest-light bg-ambient rounded-lg focus:ring-2 focus:ring-forest-green focus:border-forest-green text-forest"
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
              className="w-full p-3 border-2 border-forest-light bg-ambient rounded-lg focus:ring-2 focus:ring-forest-green focus:border-forest-green text-forest resize-none"
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
              className="w-full p-3 border-2 border-forest-light bg-ambient rounded-lg focus:ring-2 focus:ring-forest-green focus:border-forest-green text-forest"
              placeholder="e.g., travel, adventure, homestay"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => handleSubmitPost('draft')}
              disabled={isLoading}
              className="flex-1 bg-slate text-white py-3 rounded-lg font-medium hover:bg-slate-dark transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save As Draft'}
            </button>

            <button
              onClick={() => handleSubmitPost('published')}
              disabled={isLoading || !selectedImages.length || !caption.trim() || !countryInput.trim() || !cityInput.trim()}
              className="flex-1 bg-forest text-white py-3 rounded-lg font-medium hover:bg-forest-dark transition-colors disabled:opacity-50"
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
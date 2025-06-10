'use client';
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

type EditPostFormProps = {
  postId: string;
  onCancel: () => void;
  onSuccess: () => void;
};

const EditPostForm: React.FC<EditPostFormProps> = ({ postId, onCancel, onSuccess }) => {
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<{ url: string; id: number }[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch post data
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load post');
        const data = await res.json();
        setCaption(data.caption);
        setTagsInput((data.tags || []).join(', '));
        setCountryInput(data.country);
        setCityInput(data.city);
        setStatus(data.status);
        const imgs = (data.images || []).map((url: string, idx: number) => ({ url, id: idx }));
        setSelectedImages(imgs);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      }
    })();
  }, [postId]);

  const handleImageRemove = (id: number) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (newStatus: 'draft' | 'published') => {
    setLoading(true);
    setError(null);

    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t);
    const imageUrls = selectedImages.map(img => img.url);

    if (!caption.trim()) return setError('Caption can’t be empty');
    if (!imageUrls.length) return setError('Need at least one image');

    try {
      const token = localStorage.getItem('token');
      const body = {
        caption,
        tags: tagsArray,
        country: countryInput,
        city: cityInput,
        images: imageUrls,
        imageUrl: imageUrls[0],
        status: newStatus,
      };
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || 'Update failed');
      }
      alert('Post updated!');
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Edit Post</h2>
      {error && <p className="text-red-500 mb-3">{error}</p>}

      {/* Image previews */}
      <div className="flex gap-2 mb-4">
        {selectedImages.map(img => (
          <div key={img.id} className="relative">
            <img src={img.url} className="w-20 h-20 object-cover rounded" />
            <button
              onClick={() => handleImageRemove(img.id)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            >
              <Icon icon="mdi:close" className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Country</label>
          <input
            value={countryInput}
            onChange={e => setCountryInput(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">City</label>
          <input
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Caption</label>
          <textarea
            rows={3}
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tags (comma‑sep)</label>
          <input
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {loading && status==='draft' ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            {loading && status==='published' ? 'Updating...' : 'Update & Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostForm;

'use client';
import React, { useState, useEffect } from 'react';
// Iconify/react removed to resolve compilation error

interface AvailabilityPeriod {
    startDate: string; // Will be ISO string like "YYYY-MM-DD" from date input
    endDate: string;   // Will be ISO string like "YYYY-MM-DD" from date input
}
// Define the Listing type based on your Mongoose schema
interface Listing {
    _id: string;
    user: string;
    title: string;
    details: string;
    type: 'Single Room' | 'Whole Apartment' | 'Whole House';
    amenities: string[];
    city: string;
    country: string;
    roommates: string[];
    tags: string[];
    availability: AvailabilityPeriod[]; // ISO date strings
    images: string[];
    thumbnail: string;
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
}

interface EditListingFormProps {
    listingId: string;
    onCancel: () => void; // Callback to close the form
    onSuccess: () => void; // Callback to signal successful edit (e.g., to refresh parent list)
}

const propertyTypes = ['Single Room', 'Whole Apartment', 'Whole House'];
const availableAmenities = ['WiFi', 'Air Conditioning', 'Heating', 'Kitchen', 'Laundry', 'Parking', 'Gym', 'Pool'];
const commonTags = ['pets-allowed', 'dogs-allowed', 'cats-allowed', 'women-only', 'live-with-family'];
const roommateOptions = ['Male', 'Female', 'Mixed', 'No preference'];

const EditListingForm: React.FC<EditListingFormProps> = ({ listingId, onCancel, onSuccess }) => {
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Listing>>({
        title: '',
        details: '',
        type: 'Single Room',
        amenities: [],
        city: '',
        country: '',
        roommates: [],
        tags: [],
        availability: [],
        images: [],
        thumbnail: '',
        status: 'draft',
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [removeImageUrls, setRemoveImageUrls] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (listingId) {
            fetchListingData();
        } else {
            setError('No listing ID provided.');
            setLoading(false);
        }
    }, [listingId]);

    const fetchListingData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please log in.');
                // Consider redirecting to login page if this component is used without a logged-in user
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listing/${listingId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Make sure 'Bearer ' has a space after it
                },
            });

            if (response.ok) {
                const data: Listing = await response.json();
                setListing(data);
                // Pre-fill form with fetched data
                setFormData({
                    title: data.title,
                    details: data.details,
                    type: data.type,
                    amenities: data.amenities || [],
                    city: data.city,
                    country: data.country,
                    roommates: data.roommates || [],
                    tags: data.tags || [],
                    availability: data.availability || [],
                    images: data.images || [],
                    thumbnail: data.thumbnail || '',
                    status: data.status,
                });
            } else {
                const errorData = await response.json();
                setError(errorData.msg || 'Failed to fetch listing data.');
            }
        } catch (err) {
            setError('An error occurred while fetching listing data.');
            console.error('Error fetching listing:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleMultiSelectValue = (name: 'amenities' | 'roommates' | 'tags', value: string) => {
        setFormData(prev => {
            const currentArray = (prev[name] as string[]) || [];
            if (currentArray.includes(value)) {
                return { ...prev, [name]: currentArray.filter(item => item !== value) };
            }
            return { ...prev, [name]: [...currentArray, value] };
        });
    };

    const onFilesSelected = (fileList: FileList | null) => {
        if (!fileList) return;
        const filesArray = Array.from(fileList);
        setSelectedFiles(prev => [...prev, ...filesArray]);
    };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };
    const removeSelectedFileAt = (idx: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    };
    const toggleRemoveExistingUrl = (url: string) => {
        setRemoveImageUrls(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
    };

    // Availability editing removed per request

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (!formData.title || !formData.details || !formData.city || !formData.country) {
            setError('Please fill in all required fields (Title, Details, City, Country).');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please log in.');
                setLoading(false);
                return;
            }

            const form = new FormData();
            form.append('title', formData.title || '');
            form.append('details', formData.details || '');
            form.append('type', formData.type || 'Single Room');
            form.append('city', formData.city || '');
            form.append('country', formData.country || '');
            form.append('status', formData.status || 'draft');
            (formData.amenities || []).forEach(a => form.append('amenities', a));
            (formData.roommates || []).forEach(r => form.append('roommates', r));
            (formData.tags || []).forEach(t => form.append('tags', t));
            selectedFiles.forEach(file => form.append('images', file));
            removeImageUrls.forEach(url => form.append('removeImageUrls', url));

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listing/${listingId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: form,
            });

            if (response.ok) {
                alert('Listing updated successfully!');
                onSuccess();
            } else {
                const errorData = await response.json();
                setError(errorData.msg || 'Failed to update listing.');
                console.error('Error updating listing:', errorData);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error('Error updating listing:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-xl text-forest">Loading listing for editing...</p>
            </div>
        );
    }

    if (error && error !== 'No listing ID provided.') { // Show error only if it's not the initial missing ID
        return (
            <div className="p-8 bg-white rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold text-coral mb-4">Error</h2>
                <p className="text-gray-700 mb-6">{error}</p>
                <button
                    onClick={onCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!listing && !loading) { // If no listing found after loading
        return (
            <div className="p-8 bg-white rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold text-forest mb-4">Listing Not Found</h2>
                <p className="text-gray-700 mb-6">The listing you are trying to edit does not exist.</p>
                <button
                    onClick={onCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-lg mb-8 mx-auto w-full max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-forest mb-6 text-center">Edit Listing: {listing?.title}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Details */}
                <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-forest mb-4">Basic Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:forest-light focus:border-teal-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Property Type</label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type || 'Single Room'}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:forest-light focus:border-teal-500"
                                required
                            >
                                {propertyTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:forest-light focus:border-teal-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                value={formData.country || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:forest-light focus:border-teal-500"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="details" className="block text-sm font-medium text-gray-700 mt-4">Details</label>
                        <textarea
                            id="details"
                            name="details"
                            value={formData.details || ''}
                            onChange={handleChange}
                            rows={5}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:forest-light focus:from-forest-medium"
                            required
                        ></textarea>
                    </div>
                </div>

                {/* Amenities */}
                <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-forest mb-4">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                        {availableAmenities.map(amenity => {
                            const selected = formData.amenities?.includes(amenity);
                            return (
                                <button
                                    key={amenity}
                                    type="button"
                                    onClick={() => toggleMultiSelectValue('amenities', amenity)}
                                    className={`flex items-center px-3 py-2 rounded-md border text-sm ${selected ? 'bg-teal-100 border-teal-500 text-teal-800' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
                                >
                                    {selected ? '☑' : '☐'}
                                    <span className="ml-2">{amenity}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Roommate Preferences */}
                <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-forest mb-4">Roommate Preferences</h3>
                    <div className="flex flex-wrap gap-2">
                        {roommateOptions.map(option => {
                            const selected = formData.roommates?.includes(option);
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => toggleMultiSelectValue('roommates', option)}
                                    className={`flex items-center px-3 py-2 rounded-md border text-sm ${selected ? 'bg-teal-100 border-teal-500 text-teal-800' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
                                >
                                    {selected ? '☑' : '☐'}
                                    <span className="ml-2">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tags (Features) */}
                <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-forest mb-4">Additional Features (Tags)</h3>
                    <div className="flex flex-wrap gap-2">
                        {commonTags.map(tag => {
                            const selected = formData.tags?.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleMultiSelectValue('tags', tag)}
                                    className={`flex items-center px-3 py-2 rounded-md border text-sm ${selected ? 'bg-teal-100 border-teal-500 text-teal-800' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
                                >
                                    {selected ? '☑' : '☐'}
                                    <span className="ml-2 capitalize">{tag.replace(/-/g, ' ')}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Images - Drag & Drop */}
                <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-forest mb-4">Images</h3>
                    {listing?.images?.length ? (
                        <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {listing.images.map((url, idx) => {
                                const marked = removeImageUrls.includes(url);
                                return (
                                    <div key={idx} className={`relative group rounded overflow-hidden border ${marked ? 'border-red-400' : 'border-transparent'}`}>
                                        <img src={url} alt={`Existing ${idx+1}`} className={`w-full h-24 object-cover ${marked ? 'opacity-50' : ''}`} />
                                        <button
                                            type="button"
                                            onClick={() => toggleRemoveExistingUrl(url)}
                                            className="absolute top-1 right-1 bg-white/90 rounded px-2 py-0.5 text-xs shadow hidden group-hover:block"
                                        >
                                            {marked ? 'Undo' : 'Remove'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        className={`rounded-xl p-6 text-center transition-colors border-2 border-dashed ${isDragging ? 'bg-forest/10 border-forest' : 'bg-white border-gray-300'}`}
                    >
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-forest" viewBox="0 0 24 24"><path fill="currentColor" d="M19 15v4H5v-4H3v4q0 .825.588 1.413T5 21h14q.825 0 1.413-.587T21 19v-4zM11 6.825L9.4 8.4L8 7l4-4l4 4l-1.4 1.4L13 6.825V16h-2z"/></svg>
                            </div>
                            <div className="text-sm text-gray-700">Drag and drop images here</div>
                            <div className="text-xs text-gray-500">or</div>
                            <label className="inline-block">
                                <span className="px-3 py-2 rounded-md bg-forest text-white text-sm cursor-pointer hover:bg-pine">Browse Files</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => onFilesSelected(e.target.files)}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="relative rounded overflow-hidden border border-gray-200">
                                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-24 object-cover" />
                                        <button type="button" onClick={() => removeSelectedFileAt(idx)} className="absolute top-1 right-1 bg-white/90 rounded px-2 py-0.5 text-xs shadow">Remove</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-3">New uploads will be added to existing images.</p>
                    </div>
                </div>

                {/* Availability removed */}

                {/* Status */}
                <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-forest mb-4">Status</h3>
                    <select
                        id="status"
                        name="status"
                        value={formData.status || 'draft'}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:forest-light focus:border-teal-500"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>

                {/* Submit Button */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-forest hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditListingForm;

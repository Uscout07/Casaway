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

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        setFormData(prev => {
            const currentArray = prev[name as keyof Partial<Listing>] as string[] || [];
            if (checked) {
                return { ...prev, [name]: [...currentArray, value] };
            } else {
                return { ...prev, [name]: currentArray.filter(item => item !== value) };
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newImages = [...(formData.images || [])];
        newImages[index] = e.target.value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), ''],
        }));
    };

    const removeImageField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index),
        }));
    };

    const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, field: 'startDate' | 'endDate') => {
        const newAvailability = [...(formData.availability || [])];

        // Ensure the array has an object at this index
        if (!newAvailability[index]) {
            newAvailability[index] = { startDate: '', endDate: '' };
        }

        newAvailability[index][field] = e.target.value;

        setFormData(prev => ({ ...prev, availability: newAvailability }));
    };
    const addAvailabilityPeriod = () => {
        setFormData(prev => ({
            ...prev,
            availability: [...(prev.availability || []), { startDate: '', endDate: '' }], // Add a new object
        }));
    };

    const removeAvailabilityPeriod = (index: number) => {
        setFormData(prev => ({
            ...prev,
            availability: (prev.availability || []).filter((_, i) => i !== index),
        }));
    };

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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listing/${listingId}`, {
                method: 'PATCH', // or 'PATCH'
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Listing updated successfully!');
                onSuccess(); // Call success callback to refresh parent list
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
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token); // <-- Add this line
        if (!token) {
            console.error('No token found, cannot send request.');
            // You might want to display an error to the user or redirect to login
            return;
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
        <div className="p-2 sm:p-6 bg-white rounded-lg  mb-8 max-w-full md:max-w-4xl mx-auto">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {availableAmenities.map(amenity => (
                            <div key={amenity} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`amenity-${amenity}`}
                                    name="amenities"
                                    value={amenity}
                                    checked={formData.amenities?.includes(amenity) || false}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-teal-600 focus:forest-light border-gray-300 rounded"
                                />
                                <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-gray-700">{amenity}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Roommate Preferences */}
                <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-forest mb-4">Roommate Preferences</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {roommateOptions.map(option => (
                            <div key={option} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`roommate-${option}`}
                                    name="roommates"
                                    value={option}
                                    checked={formData.roommates?.includes(option) || false}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-teal-600 focus:forest-light border-gray-300 rounded"
                                />
                                <label htmlFor={`roommate-${option}`} className="ml-2 text-sm text-gray-700">{option}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tags (Features) */}
                <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-forest mb-4">Additional Features (Tags)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {commonTags.map(tag => (
                            <div key={tag} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`tag-${tag}`}
                                    name="tags"
                                    value={tag}
                                    checked={formData.tags?.includes(tag) || false}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-teal-600 focus:forest-light border-gray-300 rounded"
                                />
                                <label htmlFor={`tag-${tag}`} className="ml-2 text-sm text-gray-700 capitalize">{tag.replace(/-/g, ' ')}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Images */}
                <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-forest mb-4">Images</h3>
                    <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                    <input
                        type="text"
                        id="thumbnail"
                        name="thumbnail"
                        value={formData.thumbnail || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:forest-light focus:border-teal-500 mb-4"
                        placeholder="Main image URL for your listing"
                    />
                    {formData.thumbnail && (
                        <img src={formData.thumbnail} alt="Thumbnail Preview" className="mb-4 w-48 h-32 object-cover rounded-md shadow-sm" />
                    )}
                    <p className="block text-sm font-medium text-gray-700 mb-2">Additional Image URLs</p>
                    {(formData.images || []).map((image, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                            <input
                                type="text"
                                value={image}
                                onChange={(e) => handleImageChange(e, index)}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:forest-light focus:border-teal-500"
                                placeholder={`Image URL ${index + 1}`}
                            />
                            <button
                                type="button"
                                onClick={() => removeImageField(index)}
                                className="p-2 text-coral hover:text-red-800 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m3.707 6.293a1 1 0 0 0-1.414 0L12 10.586L9.707 8.293a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 0 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0 0-1.414Z"/></svg>
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addImageField}
                        className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4c4.418 0 8 3.582 8 8s-3.582 8-8 8s-8-3.582-8-8s3.582-8 8-8m0 2a6 6 0 1 0 0 12a6 6 0 0 0 0-12m1 5h2v2h-2v2h-2v-2H9v-2h2V9h2v2Z"/></svg>
                        <span>Add Image URL</span>
                    </button>
                </div>

                {/* Availability Dates */}
                <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-forest mb-4">Availability</h3>
                    {/* Ensure formData.availability is an array and has even length for pairs */}
                    {(formData.availability || []).map((period, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                            <input
                                type="date"
                                value={period.startDate || ''}
                                onChange={(e) => handleAvailabilityChange(e, index, 'startDate')}
                                className="block w-full sm:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:forest-light focus:border-teal-500"
                            />
                            <span className="text-gray-600">-</span>
                            <input
                                type="date"
                                value={period.endDate || ''}
                                onChange={(e) => handleAvailabilityChange(e, index, 'endDate')}
                                className="block w-full sm:w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:forest-light focus:border-teal-500"
                            />
                            <button
                                type="button"
                                onClick={() => removeAvailabilityPeriod(index)}
                                className="p-2 text-coral hover:text-red-800 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m3.707 6.293a1 1 0 0 0-1.414 0L12 10.586L9.707 8.293a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 0 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0 0-1.414Z"/></svg>
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addAvailabilityPeriod}
                        className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4c4.418 0 8 3.582 8 8s-3.582 8-8 8s-8-3.582-8-8s3.582-8 8-8m0 2a6 6 0 1 0 0 12a6 6 0 0 0 0-12m1 5h2v2h-2v2h-2v-2H9v-2h2V9h2v2Z"/></svg>
                        <span>Add Availability Period</span>
                    </button>
                    <p className="text-sm text-gray-500 mt-2">Enter dates inYYYY-MM-DD format.</p>
                </div>

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

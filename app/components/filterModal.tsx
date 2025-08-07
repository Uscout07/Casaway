// app/components/filterModal.tsx
'use client';
import React from 'react';
import { Icon } from '@iconify/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type ListingType = '' | 'Single Room' | 'Whole Apartment' | 'Whole House';

interface Props {
  showFilterModal: boolean;
  setShowFilterModal: (val: boolean) => void;

  destinationInput: string;
  setDestinationInput: (val: string) => void;

  startDate: Date | null;
  setStartDate: (val: Date | null) => void;
  endDate: Date | null;
  setEndDate: (val: Date | null) => void;

  selectedListingType: ListingType;
  setSelectedListingType: (val: ListingType) => void;
  // ADDED BACK: bedroomOnly with correct type
  bedroomOnly: boolean;
  setBedroomOnly: React.Dispatch<React.SetStateAction<boolean>>; // Correct type

  liveWithFamily: boolean;
  setLiveWithFamily: (val: boolean) => void;
  womenOnly: boolean;
  setWomenOnly: (val: boolean) => void;

  petsAllowed: boolean;
  setPetsAllowed: (val: boolean) => void;
  dogsAllowed: boolean;
  setDogsAllowed: (val: boolean) => void;
  catsAllowed: boolean;
  setCatsAllowed: React.Dispatch<React.SetStateAction<boolean>>;

  selectedAmenities: string[];
  setSelectedAmenities: React.Dispatch<React.SetStateAction<string[]>>;
  allAmenities: string[];

  selectedFeatures: string[];
  setSelectedFeatures: React.Dispatch<React.SetStateAction<string[]>>;
  allFeatures: string[];

  fetchListings: () => void;
  // ADDED BACK: setSearchQuery with correct type
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>; // Correct type
}

const FilterModal: React.FC<Props> = ({
  showFilterModal,
  setShowFilterModal,

  destinationInput,
  setDestinationInput,

  startDate,
  setStartDate,
  endDate,
  setEndDate,

  selectedListingType,
  setSelectedListingType,
  bedroomOnly, // Ensure destructuring
  setBedroomOnly, // Ensure destructuring

  liveWithFamily,
  setLiveWithFamily,
  womenOnly,
  setWomenOnly,

  petsAllowed,
  setPetsAllowed,
  dogsAllowed,
  setDogsAllowed,
  catsAllowed,
  setCatsAllowed,

  selectedAmenities,
  setSelectedAmenities,
  allAmenities,

  selectedFeatures,
  setSelectedFeatures,
  allFeatures,

  fetchListings,
  setSearchQuery, // Ensure destructuring
}) => {
  if (!showFilterModal) return null;

  const resetFilters = () => {
    setSearchQuery(''); // Correctly called now that setSearchQuery is a prop
    setDestinationInput('');
    setStartDate(null);
    setEndDate(null);
    setSelectedListingType('');
    setBedroomOnly(false); // Reset bedroomOnly
    setLiveWithFamily(false);
    setWomenOnly(false);
    setPetsAllowed(false);
    setDogsAllowed(false);
    setCatsAllowed(false);
    setSelectedAmenities([]);
    setSelectedFeatures([]);
  };

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleFeatureChange = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  return (
    <div className="fixed inset-0 bg-ambient bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold">Filters</h2>
          <button
            type="button"
            onClick={() => setShowFilterModal(false)}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Close filters"
          >
            <Icon icon="material-symbols:close" className="w-8 h-8" />
          </button>
        </div>

        {/* Dates & Duration */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Dates & Duration</h3>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-3">
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Select start date"
                className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-forest focus:border-transparent"
                dateFormat="yyyy/MM/dd"
              />
            </div>
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || undefined}
                placeholderText="Select end date"
                className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-forest focus:border-transparent"
                dateFormat="yyyy/MM/dd"
              />
            </div>
          </div>
          {startDate && endDate && (
            <p className="text-sm text-gray-600 mt-2">
              Duration: {Math.abs((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          )}
        </div>

        {/* Listing Type */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Listing Type</h3>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`px-4 py-2 rounded-full border ${
                selectedListingType === '' ? 'bg-forest text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedListingType('')}
            >
              Any
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full border ${
                selectedListingType === 'Single Room' ? 'bg-forest text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedListingType('Single Room')}
            >
              Single Room
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full border ${
                selectedListingType === 'Whole Apartment' ? 'bg-forest text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedListingType('Whole Apartment')}
            >
              Whole Apartment
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full border ${
                selectedListingType === 'Whole House' ? 'bg-forest text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedListingType('Whole House')}
            >
              Whole House
            </button>
          </div>

          <div className="mt-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-forest rounded focus:ring-forest"
                checked={bedroomOnly}
                onChange={(e) => setBedroomOnly(e.target.checked)}
              />
              <span className="ml-2 text-gray-700">Show only bedrooms</span>
            </label>
          </div>
        </div>

        {/* Roommate Preferences — Only show for 'Single Room' */}
        {selectedListingType === 'Single Room' && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Roommate Preferences</h3>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-forest rounded focus:ring-forest"
                  checked={liveWithFamily}
                  onChange={(e) => setLiveWithFamily(e.target.checked)}
                />
                <span className="ml-2 text-gray-700">Live with Family</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-forest rounded focus:ring-forest"
                  checked={womenOnly}
                  onChange={(e) => setWomenOnly(e.target.checked)}
                />
                <span className="ml-2 text-gray-700">Women Only Roommates</span>
              </label>
            </div>
          </div>
        )}

        {/* Pet Preferences */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Pet Compatibility</h3>
          <div className="flex flex-col space-y-2">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-forest rounded focus:ring-forest"
                checked={petsAllowed}
                onChange={(e) => {
                  setPetsAllowed(e.target.checked);
                  if (!e.target.checked) {
                    setDogsAllowed(false);
                    setCatsAllowed(false);
                  }
                }}
              />
              <span className="ml-2 text-gray-700">Are you okay living with pets?</span>
            </label>

            {petsAllowed && (
              <div className="ml-6 space-y-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-forest rounded focus:ring-forest"
                    checked={dogsAllowed}
                    onChange={(e) => setDogsAllowed(e.target.checked)}
                  />
                  <span className="ml-2 text-gray-700">Dogs</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-forest rounded focus:ring-forest"
                    checked={catsAllowed}
                    onChange={(e) => setCatsAllowed(e.target.checked)}
                  />
                  <span className="ml-2 text-gray-700">Cats</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Listing Facilities (Amenities)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allAmenities.map((amenity) => (
              <label key={amenity} className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-forest rounded focus:ring-forest"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                />
                <span className="ml-2 capitalize">{amenity.replace(/-/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Features & Views</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allFeatures.map((feature) => (
              <label key={feature} className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-forest rounded focus:ring-forest"
                  checked={selectedFeatures.includes(feature)}
                  onChange={() => handleFeatureChange(feature)}
                />
                <span className="ml-2 capitalize">{feature.replace(/-/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t mt-6">
          <button
            type="button"
            onClick={() => {
              resetFilters();
              fetchListings();
              setShowFilterModal(false);
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={() => {
              fetchListings();
              setShowFilterModal(false);
            }}
            className="px-6 py-3 bg-forest text-white rounded-lg hover:bg-pine transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
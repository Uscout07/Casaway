// app/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import SearchBar from './components/searchBar';
import FilterModal from './components/filterModal';
import 'react-datepicker/dist/react-datepicker.css';
import ListingCard from './components/listingCard';
import { Listing } from './types'; // <--- Crucial: Ensure this is correctly importing the shared Listing type


export default function HomePage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // ── AUTOCOMPLETE STATE ──
  const [destinationInput, setDestinationInput] = useState<string>('');
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState<boolean>(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState<boolean>(false);
  const [isSearchingDestinations, setIsSearchingDestinations] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 20;

  // ── FILTER / SEARCH STATE ──
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [selectedListingType, setSelectedListingType] = useState<'' | 'Single Room' | 'Whole Apartment' | 'Whole House'>('');
  const [bedroomOnly, setBedroomOnly] = useState<boolean>(false);

  const [liveWithFamily, setLiveWithFamily] = useState<boolean>(false);
  const [womenOnly, setWomenOnly] = useState<boolean>(false);

  const [petsAllowed, setPetsAllowed] = useState<boolean>(false);
  const [dogsAllowed, setDogsAllowed] = useState<boolean>(false);
  const [catsAllowed, setCatsAllowed] = useState<boolean>(false);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const allAmenities = [
    'washing-machine',
    'dryer',
    'free-parking',
    'office-desk',
    'office-chair',
    'monitor',
    'heater',
    'air-conditioner',
  ];
  const allFeatures = ['garden', 'backyard', 'mountain-view', 'ocean-view', 'lake-view', 'beach-access'];

  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

  // ── LISTINGS STATE ──
  const [listings, setListings] = useState<Listing[]>([]); // This Listing type now correctly points to types/index.ts
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ── DEBOUNCE HELPER ──
  const debounce = (fn: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  // ── AUTOCOMPLETE LOGIC ──
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      setIsSearchingDestinations(true);
      try {
        const cityUrl = `${API_BASE_URL}/api/listing/autocomplete/cities?query=${encodeURIComponent(query)}`;
        const cityRes = await fetch(cityUrl);
        if (!cityRes.ok) {
          throw new Error('Failed to fetch city suggestions');
        }
        const cityData: string[] = (await cityRes.json()) || [];
        setCitySuggestions(cityData);
        setShowCitySuggestions(cityData.length > 0);

        const countryUrl = `${API_BASE_URL}/api/listing/autocomplete/countries?query=${encodeURIComponent(query)}`;
        const countryRes = await fetch(countryUrl);
        if (!countryRes.ok) {
          throw new Error('Failed to fetch country suggestions');
        }
        const countryData: string[] = (await countryRes.json()) || [];
        setCountrySuggestions(countryData);
        setShowCountrySuggestions(countryData.length > 0);
      } catch (err) {
        setCitySuggestions([]);
        setCountrySuggestions([]);
      } finally {
        setIsSearchingDestinations(false);
      }
    }, 300),
    [API_BASE_URL]
  );

  useEffect(() => {
    if (destinationInput.length > 1) {
      fetchSuggestions(destinationInput);
    } else {
      setCitySuggestions([]);
      setCountrySuggestions([]);
      setShowCitySuggestions(false);
      setShowCountrySuggestions(false);
    }
  }, [destinationInput, fetchSuggestions]);

  // ── BUILD QUERY STRING ──
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    if (selectedCountries.length > 0) {
      params.append('countries', selectedCountries.join(','));
    }
    if (selectedCities.length > 0) {
      params.append('cities', selectedCities.join(','));
    }
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    if (selectedListingType) {
      params.append('type', selectedListingType);
    }
    if (bedroomOnly) {
      params.append('bedroomOnly', 'true');
    }
    if (liveWithFamily) {
      params.append('liveWithFamily', 'true');
    }
    if (womenOnly) {
      params.append('womenOnly', 'true');
    }
    if (petsAllowed) {
      params.append('petsAllowed', 'true');
    }
    if (dogsAllowed) {
      params.append('dogsAllowed', 'true');
    }
    if (catsAllowed) {
      params.append('catsAllowed', 'true');
    }
    if (selectedAmenities.length > 0) {
      params.append('amenities', selectedAmenities.join(','));
    }
    if (selectedFeatures.length > 0) {
      params.append('features', selectedFeatures.join(','));
    }
    return params.toString();
  }, [
    searchQuery,
    selectedCountries,
    selectedCities,
    startDate,
    endDate,
    selectedListingType,
    bedroomOnly,
    liveWithFamily,
    womenOnly,
    petsAllowed,
    dogsAllowed,
    catsAllowed,
    selectedAmenities,
    selectedFeatures,
  ]);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const qs = buildQueryString();
      const url = `${API_BASE_URL}/api/listing${qs ? `?${qs}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setListings(data);
      setError(null);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, buildQueryString]);


  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // ── HANDLERS ──
  const handleSelectCountry = (country: string) => {
    setDestinationInput(country);
    setSelectedCountries([country]);
    setSelectedCities([]);
    setSearchQuery('');
    setShowCountrySuggestions(false);
    setShowCitySuggestions(false);
    fetchListings();
  };

  const handleSelectCity = (combo: string) => {
    const [cityPart, countryPart] = combo.split(',').map((s) => s.trim());
    setDestinationInput(combo);
    setSelectedCities([cityPart]);
    setSelectedCountries([countryPart]);
    setSearchQuery('');
    setShowCitySuggestions(false);
    setShowCountrySuggestions(false);
    fetchListings();
  };

  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = listings.slice(indexOfFirstListing, indexOfLastListing);


  return (
    <div className="min-h-screen bg-ambient pt-[11vh]">
      <SearchBar
        destinationInput={destinationInput}
        setDestinationInput={val => {
          setDestinationInput(val);
        }}
        countrySuggestions={countrySuggestions}
        citySuggestions={citySuggestions}
        showCountrySuggestions={showCountrySuggestions}
        showCitySuggestions={showCitySuggestions}
        isSearchingDestinations={isSearchingDestinations}
        setShowCountrySuggestions={setShowCountrySuggestions}
        setShowCitySuggestions={setShowCitySuggestions}
        handleSelectCountry={handleSelectCountry}
        handleSelectCity={handleSelectCity}
        fetchListings={fetchListings}
        openFilterModal={() => setShowFilterModal(true)}
      />

      <div className="px-6">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && listings.length === 0 && (
          <div className="text-center py-12 font-inter">
            <Icon icon="material-symbols:home-outline" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600">Adjust your search filters or try a different destination.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
          {currentListings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} /> // This is now correctly typed
          ))}
        </div>
      </div>
      {listings.length > listingsPerPage && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className={`px-4 py-2 border rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            Prev
          </button>
          <span className="text-gray-700">Page {currentPage} of {Math.ceil(listings.length / listingsPerPage)}</span>
          <button
            disabled={currentPage === Math.ceil(listings.length / listingsPerPage)}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className={`px-4 py-2 border rounded ${currentPage === Math.ceil(listings.length / listingsPerPage) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            Next
          </button>
        </div>
      )}

      <FilterModal
        showFilterModal={showFilterModal}
        setShowFilterModal={setShowFilterModal}

        destinationInput={destinationInput}
        setDestinationInput={setDestinationInput}

        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}

        selectedListingType={selectedListingType}
        setSelectedListingType={setSelectedListingType}
        bedroomOnly={bedroomOnly} // Now correctly passed
        setBedroomOnly={setBedroomOnly} // Now correctly passed

        liveWithFamily={liveWithFamily}
        setLiveWithFamily={setLiveWithFamily}
        womenOnly={womenOnly}
        setWomenOnly={setWomenOnly}

        petsAllowed={petsAllowed}
        setPetsAllowed={setPetsAllowed}
        dogsAllowed={dogsAllowed}
        setDogsAllowed={setDogsAllowed}
        catsAllowed={catsAllowed}
        setCatsAllowed={setCatsAllowed}

        selectedAmenities={selectedAmenities}
        setSelectedAmenities={setSelectedAmenities}
        allAmenities={allAmenities}

        selectedFeatures={selectedFeatures}
        setSelectedFeatures={setSelectedFeatures}
        allFeatures={allFeatures}

        fetchListings={fetchListings}
        setSearchQuery={setSearchQuery} // Now correctly passed
      />
    </div>
  );
}
'use client';
import React, { useRef } from 'react';
import { Icon } from '@iconify/react';

interface Props {
  destinationInput: string;
  setDestinationInput: (val: string) => void;
  countrySuggestions: string[];
  citySuggestions: string[];
  showCountrySuggestions: boolean;
  showCitySuggestions: boolean;
  isSearchingDestinations: boolean;
  setShowCountrySuggestions: (b: boolean) => void;
  setShowCitySuggestions: (b: boolean) => void;
  handleSelectCountry: (country: string) => void;
  handleSelectCity: (city: string) => void;
  fetchListings: () => void;
  openFilterModal: () => void;
}

const SearchBar: React.FC<Props> = ({
  destinationInput,
  setDestinationInput,
  countrySuggestions,
  citySuggestions,
  showCountrySuggestions,
  showCitySuggestions,
  isSearchingDestinations,
  setShowCountrySuggestions,
  setShowCitySuggestions,
  handleSelectCountry,
  handleSelectCity,
  fetchListings,
  openFilterModal,
}) => {
  const destinationInputRef = useRef<HTMLInputElement>(null);

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestinationInput(e.target.value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowCountrySuggestions(false);
      setShowCitySuggestions(false);
      fetchListings();
    }
  };

  const onFocus = () => {
    if (destinationInput.length > 0) {
      setShowCountrySuggestions(countrySuggestions.length > 0);
      setShowCitySuggestions(citySuggestions.length > 0);
    }
  };

  return (
    <div className="flex relative items-center justify-center pb-10">
      <div className="relative w-[300px] lg:w-[735px]">
        <Icon
          icon="mdi:search"
          className="text-coral w-[25px] h-[25px] lg:w-[32px] lg:[32px] absolute left-4 top-1/2 -translate-y-1/2 z-10"
        />
        <input
          ref={destinationInputRef}
          type="text"
          className="w-[312px] lg:w-full rounded-[40px] bg-white pl-12 lg:pl-16 pr-6 py-4 shadow-lg"
          placeholder="Search for destinations or dates"
          value={destinationInput}
          onChange={onChangeInput}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        />

        {(showCountrySuggestions || showCitySuggestions || isSearchingDestinations || (destinationInput.length > 1 && !isSearchingDestinations)) && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {isSearchingDestinations && (
              <div className="p-3 text-center text-gray-500">
                <Icon icon="line-md:loading-loop" className="w-6 h-6 inline-block mr-2" />
                Searching...
              </div>
            )}

            {countrySuggestions.length > 0 && (
              <>
                <div className="text-sm text-gray-500 px-3 pt-3 font-semibold">Countries</div>
                {countrySuggestions.map((country) => (
                  <div
                    key={`country-${country}`}
                    className="p-3 cursor-pointer hover:bg-gray-100 flex items-center"
                    onClick={() => handleSelectCountry(country)}
                  >
                    <Icon
                      icon="material-symbols:location-on-outline"
                      className="w-5 h-5 mr-2 text-gray-500"
                    />
                    {country}
                  </div>
                ))}
              </>
            )}

            {citySuggestions.length > 0 && (
              <>
                <div className="text-sm text-gray-500 px-3 pt-3 font-semibold border-t">
                  Cities
                </div>
                {citySuggestions.map((city) => (
                  <div
                    key={`city-${city}`}
                    className="p-3 cursor-pointer hover:bg-gray-100 flex items-center"
                    onClick={() => handleSelectCity(city)}
                  >
                    <Icon
                      icon="material-symbols:location-city-outline"
                      className="w-5 h-5 mr-2 text-gray-500"
                    />
                    {city}
                  </div>
                ))}
              </>
            )}

            {!isSearchingDestinations &&
              countrySuggestions.length === 0 &&
              citySuggestions.length === 0 &&
              destinationInput.length > 1 && (
                <div className="p-3 text-gray-500">No destination found.</div>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className="text-black ml-1 lg:ml-5 p-2 rounded-full hover:bg-gray-100 transition-colors"
        onClick={openFilterModal}
        aria-label="Open Filters"
      >
        <Icon icon="bx:filter" width="40" height="40" />
      </button>
    </div>
  );
};

export default SearchBar;

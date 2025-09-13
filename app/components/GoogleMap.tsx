'use client';

import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useEffect, useRef, useState, useCallback } from 'react';

interface MapLocation {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface GoogleMapProps {
  locations: MapLocation[];
  onLocationSelect?: (location: MapLocation) => void;
}

interface MapComponentProps {
  locations: MapLocation[];
  onLocationSelect?: (location: MapLocation) => void;
}

const GoogleMapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Custom marker icon (green dot)
const createCustomMarker = (map: google.maps.Map, position: google.maps.LatLng, title: string) => {
  return new google.maps.Marker({
    position,
    map,
    title,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#214F3F',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 8,
    },
  });
};

// Map component that renders the actual Google Map
const MapComponent = ({ locations, onLocationSelect }: MapComponentProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Calculate map center and zoom - Always show world view
  const getMapCenter = useCallback(() => {
    // Always center on world view (equator and prime meridian)
    return { lat: 0, lng: 0 };
  }, []);

  const getMapZoom = useCallback(() => {
    // Always use zoom level 2 for world view
    return 2;
  }, []);

  // Initialize map
  useEffect(() => {
    if (ref.current && !map) {
      const mapInstance = new google.maps.Map(ref.current, {
        center: getMapCenter(),
        zoom: getMapZoom(),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      setMap(mapInstance);
    }
  }, [ref, map, getMapCenter, getMapZoom]);

  // Update map center and zoom when locations change
  useEffect(() => {
    if (map) {
      map.setCenter(getMapCenter());
      map.setZoom(getMapZoom());
    }
  }, [map, getMapCenter, getMapZoom]);

  // Create markers
  useEffect(() => {
    if (map) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      
      // Create new markers
      const newMarkers = locations.map(location => {
        const marker = createCustomMarker(
          map,
          new google.maps.LatLng(location.lat, location.lng),
          `${location.city}, ${location.country}`
        );

        // Add click listener
        marker.addListener('click', () => {
          if (onLocationSelect) {
            onLocationSelect(location);
          }
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="text-align: center; padding: 8px; font-family: Arial, sans-serif;">
              <strong style="color: #214F3F; font-size: 14px;">${location.city}</strong><br>
              <span style="color: #666; font-size: 12px;">${location.country}</span><br>
              <span style="color: #999; font-size: 11px;">Casaway Community Member</span>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          if (onLocationSelect) {
            onLocationSelect(location);
          }
        });

        return marker;
      });

      setMarkers(newMarkers);
    }
  }, [map, locations, onLocationSelect]);

  return <div ref={ref} style={{ height: '100%', width: '100%' }} />;
};

// Loading component
const LoadingComponent = () => (
  <div className="flex h-full items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-2"></div>
      <p className="text-gray-600">Loading Google Maps...</p>
    </div>
  </div>
);

// Error component
const ErrorComponent = () => (
  <div className="flex h-full items-center justify-center">
    <div className="text-center">
      <div className="text-red-500 text-4xl mb-2">⚠️</div>
      <p className="text-red-600">Failed to load Google Maps</p>
      <p className="text-gray-600 text-sm mt-1">Please check your API key configuration</p>
    </div>
  </div>
);

// Main Google Map component
const GoogleMap = ({ locations, onLocationSelect }: GoogleMapProps) => {
  const apiKey = GoogleMapKey;

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-4xl mb-2">🔑</div>
          <p className="text-yellow-600">Google Maps API Key Required</p>
          <p className="text-gray-600 text-sm mt-1">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables</p>
        </div>
      </div>
    );
  }

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <LoadingComponent />;
      case Status.FAILURE:
        return <ErrorComponent />;
      case Status.SUCCESS:
        return <MapComponent locations={locations} onLocationSelect={onLocationSelect} />;
    }
  };

  return (
    <Wrapper apiKey={apiKey} render={render} />
  );
};

export default GoogleMap;

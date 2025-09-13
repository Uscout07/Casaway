'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useRef, useMemo } from 'react';

// Global map instance tracker to prevent double initialization
let globalMapInstance: L.Map | null = null;

// --- FIX FOR DEFAULT ICON IN NEXT.JS ---
// This ensures Leaflet's default icons work correctly in Next.js.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});
// --- END FIX ---

// Custom green dot icon matching mobile style
const customDotIcon = L.divIcon({
    html: `<span style="background-color: #214F3F; width: 1rem; height: 1rem; display: block; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></span>`,
    className: 'bg-transparent border-0',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

interface MapLocation {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface MapProps {
  locations: MapLocation[];
  onLocationSelect?: (location: MapLocation) => void;
}

const Map = ({ locations, onLocationSelect }: MapProps) => {
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize map center and zoom to prevent unnecessary recalculations
  const mapCenter = useMemo(() => {
    if (locations.length === 0) {
      return [20, 10] as [number, number];
    }

    const lats = locations.map(l => l.lat);
    const lngs = locations.map(l => l.lng);
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    return [centerLat, centerLng] as [number, number];
  }, [locations]);

  const mapZoom = useMemo(() => {
    if (locations.length === 0) return 2;
    if (locations.length === 1) return 8;
    return 3;
  }, [locations]);

  useEffect(() => {
    setIsClient(true);
    
    // Generate a unique key for each mount
    setMapKey(Date.now());
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.log('Map cleanup error (safe to ignore):', error);
        }
        mapRef.current = null;
        globalMapInstance = null;
      }
    };
  }, []);

  if (!isClient || typeof window === 'undefined') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const handleMarkerClick = (location: MapLocation) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%' }}>
      <MapContainer 
          key={`map-${mapKey}`}
          center={mapCenter} 
          zoom={mapZoom} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          ref={(map) => {
            if (map && !mapRef.current && !globalMapInstance) {
              mapRef.current = map;
              globalMapInstance = map;
            }
          }}
      >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location, idx) => (
        <Marker 
            key={`${location.lat}-${location.lng}-${idx}`} 
            position={[location.lat, location.lng]}
            icon={customDotIcon}
            eventHandlers={{
              click: () => handleMarkerClick(location)
            }}
        >
          <Popup>
            <div style={{ textAlign: 'center', padding: '4px' }}>
              <strong style={{ color: '#214F3F' }}>{location.city}</strong>
              <br />
              <span style={{ color: '#666', fontSize: '12px' }}>{location.country}</span>
              <br />
              <span style={{ color: '#999', fontSize: '11px' }}>Casaway Community Member</span>
            </div>
          </Popup>
        </Marker>
      ))}
      </MapContainer>
    </div>
  );
};

export default Map;
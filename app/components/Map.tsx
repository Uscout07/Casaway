'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

// Re-enabling the custom green dot icon
const customDotIcon = L.divIcon({
    html: `<span style="background-color: #006400; width: 1rem; height: 1rem; display: block; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></span>`,
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
}

const Map = ({ locations }: MapProps) => {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <MapContainer 
        center={[20, 10]} 
        zoom={2.5} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location, idx) => (
        <Marker 
            key={`${location.lat}-${location.lng}-${idx}`} 
            position={[location.lat, location.lng]}
            icon={customDotIcon} // Using the custom dot icon again
        >
          <Popup>
            <div style={{ textAlign: 'center' }}>
                <strong>{location.city}</strong>
                <br />
                {location.country}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
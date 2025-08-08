import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { Location } from '../types';
import './GoogleMap.css';

interface GoogleMapProps {
  locations: Location[];
  selectedLocationId: string | null;
  onLocationSelect: (locationId: string) => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ locations, selectedLocationId, onLocationSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places']
      });

      try {
        await loader.load();
        
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 35.3189, lng: 139.5477 }, // 鎌倉の中心座標
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        const infoWindowInstance = new google.maps.InfoWindow();
        
        setMap(mapInstance);
        setInfoWindow(infoWindowInstance);
      } catch (error) {
        console.error('Google Maps API loading failed:', error);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!map || !infoWindow) return;

    markers.forEach(marker => marker.setMap(null));

    const newMarkers = locations.map(location => {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: selectedLocationId === location.id ? '#e74c3c' : '#3498db',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      marker.addListener('click', () => {
        onLocationSelect(location.id);
        
        infoWindow.setContent(`
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #2c3e50;">${location.name}</h3>
            <p style="margin: 0 0 8px 0; color: #7f8c8d; font-size: 14px;">${location.address}</p>
            ${location.description ? `<p style="margin: 0; color: #34495e; font-size: 14px;">${location.description}</p>` : ''}
          </div>
        `);
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);
  }, [map, locations, selectedLocationId, infoWindow, onLocationSelect]);

  useEffect(() => {
    if (!map || !selectedLocationId) return;

    const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
    if (selectedLocation) {
      map.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      map.setZoom(16);
    }
  }, [map, selectedLocationId, locations]);

  return (
    <div className="google-map">
      <div className="map-header">
        <h2>鎌倉イベント会場マップ</h2>
      </div>
      <div className="map-container" ref={mapRef} />
      {GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE' && (
        <div className="api-key-warning">
          ⚠️ Google Maps APIキーが設定されていません。
          <br />
          .envファイルにVITE_GOOGLE_MAPS_API_KEYを設定してください。
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
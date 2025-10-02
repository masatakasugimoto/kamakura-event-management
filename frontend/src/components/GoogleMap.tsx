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
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: true,
          gestureHandling: 'auto',
          clickableIcons: true,
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
      const isSelected = selectedLocationId === location.id;

      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name,
        icon: isSelected ? {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#e74c3c',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        } : {
          url: '/zen-favicon.png',
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
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
      const targetPosition = { lat: selectedLocation.lat, lng: selectedLocation.lng };
      
      // 現在のズームレベルを取得
      const currentZoom = map.getZoom() || 14;
      
      // まずズームアウトしてから移動、その後ズームイン
      if (currentZoom > 14) {
        map.setZoom(14);
        setTimeout(() => {
          map.panTo(targetPosition);
          setTimeout(() => {
            map.setZoom(16);
          }, 800);
        }, 300);
      } else {
        // 通常の滑らかな移動
        map.panTo(targetPosition);
        setTimeout(() => {
          map.setZoom(16);
        }, 800);
      }
    }
  }, [map, selectedLocationId, locations]);

  const openInGoogleMaps = () => {
    if (!map) return;
    
    const center = map.getCenter();
    const zoom = map.getZoom();
    
    if (center) {
      const lat = center.lat();
      const lng = center.lng();
      const url = `https://www.google.com/maps/@${lat},${lng},${zoom}z`;
      window.location.href = url;
    }
  };

  return (
    <div className="google-map">
      <div className="map-container" ref={mapRef} />
      <button className="open-in-google-maps-btn" onClick={openInGoogleMaps}>
        📍 GoogleMapで開く
      </button>
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
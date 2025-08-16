import React from 'react';
import type { Location } from '../types';
import './VenueList.css';

interface VenueListProps {
  locations: Location[];
  selectedLocationId: string | null;
  onLocationSelect: (locationId: string) => void;
}

const VenueList: React.FC<VenueListProps> = ({
  locations,
  selectedLocationId,
  onLocationSelect
}) => {
  if (locations.length === 0) {
    return (
      <div className="venue-list">
        <div className="venue-list-empty">
          <p>会場情報がありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="venue-list">
      <div className="venue-list-header">
        <h2>zen2.0会場一覧</h2>
        <p className="venue-count">{locations.length}箇所の会場</p>
      </div>
      
      <div className="venue-list-content">
        {locations.map(location => (
          <div
            key={location.id}
            className={`venue-item ${selectedLocationId === location.id ? 'selected' : ''}`}
            onClick={() => onLocationSelect(location.id)}
          >
            <div className="venue-main">
              <h3 className="venue-name">{location.name}</h3>
              <p className="venue-address">{location.address}</p>
              {location.description && (
                <p className="venue-description">{location.description}</p>
              )}
            </div>
            
            
            <div className="venue-actions">
              <button
                className="map-button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://www.google.com/maps?q=${location.lat},${location.lng}`,
                    '_blank'
                  );
                }}
              >
                📍 地図で開く
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VenueList;
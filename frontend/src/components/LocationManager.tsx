import React, { useState } from 'react';
import type { Location, EventWithLocation } from '../types';
import { locationApi } from '../services/api';
import LocationForm from './LocationForm';
import './LocationManager.css';

interface LocationManagerProps {
  locations: Location[];
  events: EventWithLocation[];
  onLocationsUpdate: (locations: Location[]) => void;
}

const LocationManager: React.FC<LocationManagerProps> = ({
  locations,
  events,
  onLocationsUpdate
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateLocation = () => {
    setSelectedLocation(null);
    setIsFormOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsFormOpen(true);
  };

  const handleDeleteLocation = async (locationId: string) => {
    const eventsAtLocation = events.filter(event => event.locationId === locationId);
    
    if (eventsAtLocation.length > 0) {
      alert(`この場所は${eventsAtLocation.length}個のイベントで使用されているため削除できません。\n先にイベントを削除するか、別の場所に変更してください。`);
      return;
    }

    if (!confirm('この場所を削除してもよろしいですか？')) {
      return;
    }

    try {
      setIsLoading(true);
      await locationApi.delete(locationId);
      const updatedLocations = await locationApi.getAll();
      onLocationsUpdate(updatedLocations);
    } catch (error) {
      alert('場所の削除に失敗しました。');
      console.error('Delete error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (locationData: Omit<Location, 'id'>) => {
    try {
      setIsLoading(true);
      
      if (selectedLocation) {
        await locationApi.update(selectedLocation.id, locationData);
      } else {
        await locationApi.create(locationData);
      }
      
      const updatedLocations = await locationApi.getAll();
      onLocationsUpdate(updatedLocations);
      setIsFormOpen(false);
      setSelectedLocation(null);
    } catch (error) {
      alert('場所の保存に失敗しました。');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventCount = (locationId: string) => {
    return events.filter(event => event.locationId === locationId).length;
  };

  const getLocationEvents = (locationId: string) => {
    return events.filter(event => event.locationId === locationId);
  };

  if (isFormOpen) {
    return (
      <LocationForm
        location={selectedLocation}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setIsFormOpen(false);
          setSelectedLocation(null);
        }}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="location-manager">
      <div className="manager-header">
        <h3>📍 場所管理</h3>
        <button
          className="create-button"
          onClick={handleCreateLocation}
          disabled={isLoading}
        >
          ➕ 新しい場所を追加
        </button>
      </div>

      <div className="locations-grid">
        {locations.map((location) => {
          const eventCount = getEventCount(location.id);
          const locationEvents = getLocationEvents(location.id);
          
          return (
            <div key={location.id} className="location-card">
              <div className="location-card-header">
                <h4 className="location-name">{location.name}</h4>
                <div className="location-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEditLocation(location)}
                    disabled={isLoading}
                    title="編集"
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteLocation(location.id)}
                    disabled={isLoading || eventCount > 0}
                    title={eventCount > 0 ? 'イベントが関連付けられているため削除できません' : '削除'}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="location-info">
                <div className="location-address">
                  🏠 {location.address}
                </div>
                
                <div className="location-coordinates">
                  🗺️ 座標: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>

                {location.description && (
                  <div className="location-description">
                    {location.description}
                  </div>
                )}

                <div className="location-events">
                  <div className="event-count">
                    📅 関連イベント: {eventCount}件
                  </div>
                  
                  {locationEvents.length > 0 && (
                    <div className="related-events">
                      {locationEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="related-event">
                          {event.title}
                        </div>
                      ))}
                      {locationEvents.length > 3 && (
                        <div className="more-events">
                          他{locationEvents.length - 3}件...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {locations.length === 0 && (
          <div className="empty-state">
            <p>場所がまだ登録されていません。</p>
            <p>「新しい場所を追加」ボタンから最初の場所を追加しましょう。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationManager;
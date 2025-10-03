import React, { useEffect, useRef } from 'react';
import type { Location, EventWithLocation } from '../types';
import './VenueList.css';

interface VenueListProps {
  locations: Location[];
  events: EventWithLocation[];
  selectedLocationId: string | null;
  onLocationSelect: (locationId: string) => void;
}

const VenueList: React.FC<VenueListProps> = ({
  locations,
  events,
  selectedLocationId,
  onLocationSelect
}) => {
  const venueRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 選択された会場にスクロール
  useEffect(() => {
    if (selectedLocationId && venueRefs.current[selectedLocationId]) {
      const selectedElement = venueRefs.current[selectedLocationId];
      selectedElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedLocationId]);
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
        {locations.map(location => {
          // この会場で開催されるイベントを抽出
          const locationEvents = events.filter(event => event.locationId === location.id);

          return (
            <div
              key={location.id}
              ref={(el) => { venueRefs.current[location.id] = el; }}
              className={`venue-item ${selectedLocationId === location.id ? 'selected' : ''}`}
              onClick={() => onLocationSelect(location.id)}
            >
              <div className="venue-main">
                <h3 className="venue-name">{location.name}</h3>
                <p className="venue-address">{location.address}</p>
                {location.description && (
                  <p className="venue-description">{location.description}</p>
                )}

                {/* 関連イベント表示 */}
                {locationEvents.length > 0 && (
                  <div className="venue-events">
                    <h4 className="venue-events-title">📅 開催イベント ({locationEvents.length}件)</h4>
                    <div className="venue-events-list">
                      {locationEvents.map(event => (
                        <div key={event.id} className="venue-event-item">
                          <div className="venue-event-title">{event.title}</div>
                          <div className="venue-event-info">
                            {event.date} {event.startTime && `${event.startTime}${event.endTime ? '〜' + event.endTime : ''}`}
                          </div>
                          {event.status === 'ticket_supported' && (
                            <span className="venue-event-badge ticket">通し券対応</span>
                          )}
                          {event.status === 'ticket_not_supported' && (
                            <span className="venue-event-badge ticket-not-supported">通し券未対応</span>
                          )}
                          {event.status === 'finished' && (
                            <span className="venue-event-badge finished">終了</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {locationEvents.length === 0 && (
                  <p className="venue-no-events">この会場での開催イベントはありません</p>
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
          );
        })}
      </div>
    </div>
  );
};

export default VenueList;
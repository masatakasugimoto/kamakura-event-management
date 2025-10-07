import React, { useState, useEffect } from 'react';
import EventList from './EventList';
import VenueList from './VenueList';
import CategoryList from './CategoryList';
import type { EventWithLocation, Location } from '../types';
import './EventTabs.css';

interface EventTabsProps {
  events: EventWithLocation[];
  locations: Location[];
  selectedEventId: string | null;
  selectedLocationId: string | null;
  onEventSelect: (eventId: string) => void;
  onLocationSelect: (locationId: string) => void;
  shouldShowVenues?: boolean;
}

const EventTabs: React.FC<EventTabsProps> = ({
  events,
  locations,
  selectedEventId,
  selectedLocationId,
  onEventSelect,
  onLocationSelect,
  shouldShowVenues = false
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'venues' | 'categories'>('events');

  // shouldShowVenuesがtrueの時、会場一覧タブに切り替え
  useEffect(() => {
    if (shouldShowVenues) {
      setActiveTab('venues');
    }
  }, [shouldShowVenues]);

  return (
    <div className="event-tabs">
      <div className="tab-header">
        <button
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          イベントスケジュール
        </button>
        <button
          className={`tab-button ${activeTab === 'venues' ? 'active' : ''}`}
          onClick={() => setActiveTab('venues')}
        >
          イベント会場一覧
        </button>
        <button
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          イベントカテゴリー一覧
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'events' && (
          <EventList
            events={events}
            selectedEventId={selectedEventId}
            onEventSelect={onEventSelect}
          />
        )}
        {activeTab === 'venues' && (
          <VenueList
            locations={locations}
            events={events}
            selectedLocationId={selectedLocationId}
            onLocationSelect={onLocationSelect}
          />
        )}
        {activeTab === 'categories' && (
          <CategoryList
            events={events}
            selectedEventId={selectedEventId}
            onEventSelect={onEventSelect}
          />
        )}
      </div>
    </div>
  );
};

export default EventTabs;
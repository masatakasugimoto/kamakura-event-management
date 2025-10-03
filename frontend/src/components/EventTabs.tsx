import React, { useState } from 'react';
import EventList from './EventList';
import VenueList from './VenueList';
import type { EventWithLocation, Location } from '../types';
import './EventTabs.css';

interface EventTabsProps {
  events: EventWithLocation[];
  locations: Location[];
  selectedEventId: string | null;
  selectedLocationId: string | null;
  onEventSelect: (eventId: string) => void;
  onLocationSelect: (locationId: string) => void;
}

const EventTabs: React.FC<EventTabsProps> = ({
  events,
  locations,
  selectedEventId,
  selectedLocationId,
  onEventSelect,
  onLocationSelect
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'venues'>('events');

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
      </div>
    </div>
  );
};

export default EventTabs;
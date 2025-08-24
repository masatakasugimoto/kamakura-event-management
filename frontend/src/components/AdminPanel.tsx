import React, { useState } from 'react';
import EventManager from './EventManager';
import LocationManager from './LocationManager';
import DataManagement from './DataManagement';
import type { EventWithLocation, Location } from '../types';
import { eventApi, locationApi } from '../services/api';
import './AdminPanel.css';

interface AdminPanelProps {
  events: EventWithLocation[];
  locations: Location[];
  onEventsUpdate: (events: EventWithLocation[]) => void;
  onLocationsUpdate: (locations: Location[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  events,
  locations,
  onEventsUpdate,
  onLocationsUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'locations' | 'data'>('events');
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const [eventsData, locationsData] = await Promise.all([
        eventApi.getAll(),
        locationApi.getAll()
      ]);
      onEventsUpdate(eventsData);
      onLocationsUpdate(locationsData);
    } catch (error) {
      console.error('データの更新に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>⚙️ 管理者パネル</h2>
        <button
          className="refresh-button"
          onClick={refreshData}
          disabled={isLoading}
        >
          {isLoading ? '更新中...' : '🔄 データ更新'}
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          📅 イベント管理
        </button>
        <button
          className={`tab-button ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          📍 場所管理
        </button>
        <button
          className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          📊 データ管理
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'events' ? (
          <EventManager
            events={events}
            locations={locations}
            onEventsUpdate={onEventsUpdate}
          />
        ) : activeTab === 'locations' ? (
          <LocationManager
            locations={locations}
            events={events}
            onLocationsUpdate={onLocationsUpdate}
          />
        ) : (
          <DataManagement
            onDataUpdate={refreshData}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
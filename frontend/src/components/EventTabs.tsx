import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<'events' | 'venues'>('events');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // shouldShowVenuesがtrueの時、会場一覧タブに切り替え
  useEffect(() => {
    if (shouldShowVenues) {
      setActiveTab('venues');
    }
  }, [shouldShowVenues]);

  // 日付を正規化する関数（YYYY/MM/DD形式に統一）
  const normalizeDate = (dateString: string): string => {
    return dateString.replace(/-/g, '/');
  };

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day} (${weekday})`;
  };

  // イベントからユニークな日付リストを取得
  const uniqueDates = React.useMemo(() => {
    const dates = events.map(event => normalizeDate(event.date));
    return Array.from(new Set(dates)).sort();
  }, [events]);

  return (
    <div className="event-tabs">
      <div className="tab-header">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            スケジュール
          </button>
          <button
            className={`tab-button ${activeTab === 'venues' ? 'active' : ''}`}
            onClick={() => setActiveTab('venues')}
          >
            会場一覧
          </button>
        </div>
        <div className="tab-date-filter">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-select"
          >
            <option value="">開催日</option>
            {uniqueDates.map((date) => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'events' && (
          <EventList
            events={events}
            selectedEventId={selectedEventId}
            onEventSelect={onEventSelect}
            selectedDateFromTab={selectedDate}
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
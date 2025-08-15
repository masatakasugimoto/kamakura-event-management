import { useState, useEffect } from 'react';
import EventList from './components/EventList';
import GoogleMap from './components/GoogleMap';
import AdminPanel from './components/AdminPanel';
import type { EventWithLocation, Location } from './types';
import { eventApi, locationApi } from './services/api';
import './App.css'

function App() {
  const [events, setEvents] = useState<EventWithLocation[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [eventsData, locationsData] = await Promise.all([
          eventApi.getAll(),
          locationApi.getAll()
        ]);
        setEvents(eventsData);
        setLocations(locationsData);
      } catch (err) {
        setError('データの取得に失敗しました。サーバーが起動していることを確認してください。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedLocationId(event.locationId);
    }
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
    const eventAtLocation = events.find(e => e.locationId === locationId);
    if (eventAtLocation) {
      setSelectedEventId(eventAtLocation.id);
    } else {
      setSelectedEventId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>データを読み込んでいます...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>エラーが発生しました</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏮 zen2.0進行管理</h1>
        <div className="header-controls">
          <button
            className={`mode-toggle ${isAdmin ? 'admin' : 'participant'}`}
            onClick={() => setIsAdmin(!isAdmin)}
          >
            {isAdmin ? '👤 参加者モード' : '⚙️ 管理者モード'}
          </button>
        </div>
      </header>
      
      <main className="app-main">
        {!isAdmin ? (
          <>
            <div className="event-section">
              <EventList
                events={events}
                selectedEventId={selectedEventId}
                onEventSelect={handleEventSelect}
              />
            </div>
            <div className="map-section">
              <GoogleMap
                locations={locations}
                selectedLocationId={selectedLocationId}
                onLocationSelect={handleLocationSelect}
              />
            </div>
          </>
        ) : (
          <div className="admin-section">
            <AdminPanel
              events={events}
              locations={locations}
              onEventsUpdate={setEvents}
              onLocationsUpdate={setLocations}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App

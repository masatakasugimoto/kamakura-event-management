import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EventTabs from './components/EventTabs';
import GoogleMap from './components/GoogleMap';
import AdminPanel from './components/AdminPanel';
import ResizableSplitter from './components/ResizableSplitter';
import SettingsIcon from './components/SettingsIcon';
import EventDetail from './components/EventDetail';
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
  const [shouldShowVenues, setShouldShowVenues] = useState(false);

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
    // 地図から会場がクリックされた時、会場一覧タブに切り替え
    setShouldShowVenues(true);
    // 少し遅延してリセット（次回のクリックに備える）
    setTimeout(() => setShouldShowVenues(false), 100);
  };

  const handleModeToggle = () => {
    if (!isAdmin) {
      const password = prompt('管理者パスワードを入力してください:');
      if (password === 'zen20') {
        setIsAdmin(true);
      } else if (password !== null) {
        alert('パスワードが間違っています。');
      }
    } else {
      setIsAdmin(false);
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
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-title">
            <h1>
              zen2.0-map <a
                href="https://www.mindful-kamakura.city/"
                target="_blank"
                rel="noopener noreferrer"
                className="zen-link"
              >
                zen2.0はこちら
              </a>
            </h1>
          </div>
          <div className="header-controls">
            <button
              className={`mode-toggle ${isAdmin ? 'admin' : 'participant'}`}
              onClick={handleModeToggle}
              title={isAdmin ? '参加者モードに戻る' : '管理者モードに切り替え'}
            >
              {isAdmin ? '👤' : <SettingsIcon size={18} color="currentColor" />}
            </button>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/event/:eventId" element={
              <div className="event-detail-page">
                <EventDetail events={events} onEventSelect={handleEventSelect} />
                <div className="map-section">
                  <GoogleMap
                    locations={locations}
                    selectedLocationId={selectedLocationId}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
              </div>
            } />
            <Route path="/" element={
              !isAdmin ? (
                <>
                  <div className="event-section">
                    <EventTabs
                      events={events}
                      locations={locations}
                      selectedEventId={selectedEventId}
                      selectedLocationId={selectedLocationId}
                      onEventSelect={handleEventSelect}
                      onLocationSelect={handleLocationSelect}
                      shouldShowVenues={shouldShowVenues}
                    />
                  </div>
                  <div className="map-section">
                    <GoogleMap
                      locations={locations}
                      selectedLocationId={selectedLocationId}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>
                  <div className="app-main-mobile">
                    <ResizableSplitter
                      topContent={
                        <EventTabs
                          events={events}
                          locations={locations}
                          selectedEventId={selectedEventId}
                          selectedLocationId={selectedLocationId}
                          onEventSelect={handleEventSelect}
                          onLocationSelect={handleLocationSelect}
                          shouldShowVenues={shouldShowVenues}
                        />
                      }
                      bottomContent={
                        <GoogleMap
                          locations={locations}
                          selectedLocationId={selectedLocationId}
                          onLocationSelect={handleLocationSelect}
                        />
                      }
                      defaultTopHeight={35}
                      minTopHeight={15}
                      maxTopHeight={85}
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
              )
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App

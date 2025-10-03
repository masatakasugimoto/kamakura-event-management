import React, { useState } from 'react';
import type { EventWithLocation, Location, Event } from '../types';
import { eventApi } from '../services/api';
import EventForm from './EventForm';
import './EventManager.css';

interface EventManagerProps {
  events: EventWithLocation[];
  locations: Location[];
  onEventsUpdate: (events: EventWithLocation[]) => void;
}

const EventManager: React.FC<EventManagerProps> = ({
  events,
  locations,
  onEventsUpdate
}) => {
  const [selectedEvent, setSelectedEvent] = useState<EventWithLocation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event: EventWithLocation) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('このイベントを削除してもよろしいですか？')) {
      return;
    }

    try {
      setIsLoading(true);
      await eventApi.delete(eventId);
      const updatedEvents = await eventApi.getAll();
      onEventsUpdate(updatedEvents);
    } catch (error) {
      alert('イベントの削除に失敗しました。');
      console.error('Delete error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (eventId: string, status: Event['status']) => {
    try {
      setIsLoading(true);
      await eventApi.update(eventId, { status });
      const updatedEvents = await eventApi.getAll();
      onEventsUpdate(updatedEvents);
    } catch (error) {
      alert('ステータスの更新に失敗しました。');
      console.error('Status update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (eventData: Omit<Event, 'id'>) => {
    try {
      setIsLoading(true);
      
      if (selectedEvent) {
        await eventApi.update(selectedEvent.id, eventData);
      } else {
        await eventApi.create(eventData);
      }
      
      const updatedEvents = await eventApi.getAll();
      onEventsUpdate(updatedEvents);
      setIsFormOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      alert('イベントの保存に失敗しました。');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ticket_supported: { text: '通し券対応', className: 'status-ticket-supported' },
      ticket_not_supported: { text: '通し券未対応', className: 'status-ticket-not-supported' },
      finished: { text: '終了', className: 'status-finished' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.ticket_supported;
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDateTime = (date: string, startTime: string, endTime: string) => {
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    return `${month}/${day} ${startTime}-${endTime}`;
  };

  // 日付を正規化する関数（YYYY/MM/DD形式に統一）
  const normalizeDate = (dateString: string): string => {
    // YYYY-MM-DD形式をYYYY/MM/DD形式に変換
    return dateString.replace(/-/g, '/');
  };

  const groupedEvents = events.reduce((groups, event) => {
    // 日付を正規化してグループ化
    const normalizedDate = normalizeDate(event.date);
    if (!groups[normalizedDate]) {
      groups[normalizedDate] = [];
    }
    groups[normalizedDate].push(event);
    return groups;
  }, {} as Record<string, EventWithLocation[]>);

  if (isFormOpen) {
    return (
      <EventForm
        event={selectedEvent}
        locations={locations}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setIsFormOpen(false);
          setSelectedEvent(null);
        }}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="event-manager">
      <div className="manager-header">
        <h3>📅 イベント管理</h3>
        <button
          className="create-button"
          onClick={handleCreateEvent}
          disabled={isLoading}
        >
          ➕ 新しいイベントを作成
        </button>
      </div>

      <div className="events-list">
        {Object.entries(groupedEvents).map(([date, dateEvents]) => (
          <div key={date} className="date-group">
            <h4 className="date-header">
              {new Date(date).toLocaleDateString('ja-JP', {
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </h4>
            
            {dateEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-header">
                  <h5 className="event-title">{event.title}</h5>
                  <div className="event-actions">
                    <select
                      value={event.status}
                      onChange={(e) => handleStatusUpdate(event.id, e.target.value as Event['status'])}
                      disabled={isLoading}
                      className="status-select"
                    >
                      <option value="ticket_supported">通し券対応</option>
                      <option value="ticket_not_supported">通し券未対応</option>
                      <option value="finished">終了</option>
                    </select>
                    <button
                      className="edit-button"
                      onClick={() => handleEditEvent(event)}
                      disabled={isLoading}
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={isLoading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="event-info">
                  <div className="event-time">
                    ⏰ {formatDateTime(event.date, event.startTime, event.endTime)}
                  </div>
                  <div className="event-location">
                    📍 {event.location.name}
                  </div>
                  <div className="event-status">
                    {getStatusBadge(event.status)}
                  </div>
                </div>
                
                <div className="event-description">
                  {event.description}
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {events.length === 0 && (
          <div className="empty-state">
            <p>イベントがまだ登録されていません。</p>
            <p>「新しいイベントを作成」ボタンから最初のイベントを作成しましょう。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManager;
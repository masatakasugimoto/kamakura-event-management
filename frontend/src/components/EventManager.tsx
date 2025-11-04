import React, { useState } from 'react';
import type { EventWithLocation, Location, Event, EventCategory } from '../types';
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
  const [pendingChanges, setPendingChanges] = useState<Map<string, Partial<Event>>>(new Map());
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<string | null>(null);

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

  const handleStatusChange = (eventId: string, status: Event['status']) => {
    setPendingChanges(prev => {
      const newChanges = new Map(prev);
      const existing = newChanges.get(eventId) || {};
      newChanges.set(eventId, { ...existing, status });
      return newChanges;
    });
  };

  const handleCategoryToggle = (eventId: string, category: EventCategory) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    setPendingChanges(prev => {
      const newChanges = new Map(prev);
      const existing = newChanges.get(eventId) || {};

      // 現在のカテゴリーを取得（pending changesがあればそれを優先）
      const currentCategory = existing.category !== undefined ? existing.category : event.category;

      // カテゴリーが未設定の場合
      if (!currentCategory) {
        newChanges.set(eventId, { ...existing, category: [category] });
        return newChanges;
      }

      // 配列に変換
      const categories = Array.isArray(currentCategory) ? [...currentCategory] : [currentCategory];

      // トグル処理
      if (categories.includes(category)) {
        const updated = categories.filter(c => c !== category);
        newChanges.set(eventId, { ...existing, category: updated.length === 0 ? undefined : updated });
      } else {
        newChanges.set(eventId, { ...existing, category: [...categories, category] });
      }

      return newChanges;
    });
  };

  const isCategorySelected = (eventId: string, category: EventCategory): boolean => {
    const event = events.find(e => e.id === eventId);
    if (!event) return false;

    // pending changesがあればそれを優先
    const pendingChange = pendingChanges.get(eventId);
    const currentCategory = pendingChange?.category !== undefined ? pendingChange.category : event.category;

    if (!currentCategory) return false;
    if (Array.isArray(currentCategory)) {
      return currentCategory.includes(category);
    }
    return currentCategory === category;
  };

  const handleApplyChanges = async () => {
    if (pendingChanges.size === 0) {
      alert('変更がありません。');
      return;
    }

    try {
      setIsLoading(true);

      // すべての変更を適用
      for (const [eventId, changes] of pendingChanges.entries()) {
        await eventApi.update(eventId, changes);
      }

      const updatedEvents = await eventApi.getAll();
      onEventsUpdate(updatedEvents);
      setPendingChanges(new Map());
      alert('変更を保存しました。');
    } catch (error) {
      alert('変更の保存に失敗しました。');
      console.error('Apply changes error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardChanges = () => {
    if (pendingChanges.size === 0) return;
    if (confirm('変更を破棄してもよろしいですか？')) {
      setPendingChanges(new Map());
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

  const getDisplayStatus = (eventId: string): Event['status'] => {
    const pendingChange = pendingChanges.get(eventId);
    if (pendingChange?.status) return pendingChange.status;
    const event = events.find(e => e.id === eventId);
    return event?.status || 'ticket_supported';
  };

  const getDisplayCategories = (eventId: string): EventCategory | EventCategory[] | undefined => {
    const pendingChange = pendingChanges.get(eventId);
    if (pendingChange?.category !== undefined) return pendingChange.category;
    const event = events.find(e => e.id === eventId);
    return event?.category;
  };

  const allCategories: EventCategory[] = ['伝統', 'ビジネス', '対話', '展示', '食', '自然', 'パフォーマンス', '体験'];

  return (
    <div className="event-manager">
      <div className="manager-header">
        <h3>📅 イベント管理</h3>
        <div className="header-actions">
          {pendingChanges.size > 0 && (
            <>
              <span className="pending-count">
                {pendingChanges.size}件の変更
              </span>
              <button
                className="discard-button"
                onClick={handleDiscardChanges}
                disabled={isLoading}
              >
                破棄
              </button>
              <button
                className="apply-button"
                onClick={handleApplyChanges}
                disabled={isLoading}
              >
                データ更新
              </button>
            </>
          )}
          <button
            className="create-button"
            onClick={handleCreateEvent}
            disabled={isLoading}
          >
            ➕ 新しいイベントを作成
          </button>
        </div>
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
              <div key={event.id} className={`event-card ${pendingChanges.has(event.id) ? 'has-changes' : ''} ${event.highlighted ? 'highlighted' : ''}`}>
                <div className="event-card-header">
                  <h5 className="event-title">{event.title}</h5>
                  <div className="event-actions">
                    <select
                      value={getDisplayStatus(event.id)}
                      onChange={(e) => handleStatusChange(event.id, e.target.value as Event['status'])}
                      disabled={isLoading}
                      className="status-select"
                    >
                      <option value="ticket_supported">通し券対応</option>
                      <option value="ticket_not_supported">通し券未対応</option>
                      <option value="finished">終了</option>
                    </select>
                    <div className="category-selector">
                      <button
                        className="category-dropdown-button"
                        onClick={() => setIsCategoryDropdownOpen(isCategoryDropdownOpen === event.id ? null : event.id)}
                        disabled={isLoading}
                      >
                        🏷️ カテゴリー
                      </button>
                      {isCategoryDropdownOpen === event.id && (
                        <div className="category-dropdown">
                          {allCategories.map(category => (
                            <label key={category} className="category-checkbox-item">
                              <input
                                type="checkbox"
                                checked={isCategorySelected(event.id, category)}
                                onChange={() => handleCategoryToggle(event.id, category)}
                                disabled={isLoading}
                              />
                              <span>{category}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
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
                    {event.location ? `📍 ${event.location.name}` : '💻 オンライン開催'}
                  </div>
                  <div className="event-status">
                    {getStatusBadge(getDisplayStatus(event.id))}
                  </div>
                  {(() => {
                    const displayCats = getDisplayCategories(event.id);
                    if (!displayCats) return null;
                    const cats = Array.isArray(displayCats) ? displayCats : [displayCats];
                    return (
                      <div className="event-categories-display">
                        🏷️ {cats.join(', ')}
                      </div>
                    );
                  })()}
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
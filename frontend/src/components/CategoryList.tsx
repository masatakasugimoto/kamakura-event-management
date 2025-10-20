import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { EventWithLocation, EventCategory } from '../types';
import './CategoryList.css';

interface CategoryListProps {
  events: EventWithLocation[];
  selectedEventId: string | null;
  onEventSelect: (eventId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ events, selectedEventId, onEventSelect }) => {
  const navigate = useNavigate();

  const categories: EventCategory[] = ['伝統', 'ビジネス', '対話', '展示', '食', '自然', 'パフォーマンス', '体験'];

  const categoryIcons: Record<EventCategory, string> = {
    '伝統': 'zentradition.png',
    'ビジネス': 'zenbusiness.png',
    '対話': 'zendialogue.png',
    '展示': 'zenexhibition.png',
    '食': 'zenfood.png',
    '自然': 'zennatureact.png',
    'パフォーマンス': 'zenperformance.png',
    '体験': 'zenworkshop.png',
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day} (${weekday})`;
  };

  const formatTime = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return '';
    return `${startTime} - ${endTime}`;
  };

  const handleShareClick = (e: React.MouseEvent, event: EventWithLocation) => {
    e.stopPropagation();
    if (event.eventUrl) {
      window.open(event.eventUrl, '_blank');
    } else {
      navigate(`/event/${event.id}`);
    }
  };

  // カテゴリー毎にイベントをグループ化し、日時でソート
  const groupedByCategory = categories.reduce((groups, category) => {
    const categoryEvents = events
      .filter(event => event.category === category)
      .sort((a, b) => {
        // 日付でソート
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;

        // 同じ日付の場合は開始時間でソート
        return a.startTime.localeCompare(b.startTime);
      });

    if (categoryEvents.length > 0) {
      groups[category] = categoryEvents;
    }
    return groups;
  }, {} as Record<EventCategory, EventWithLocation[]>);

  // カテゴリーが設定されていないイベント
  const uncategorizedEvents = events
    .filter(event => !event.category)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

  return (
    <div className="category-list">
      <h2>イベントカテゴリー一覧</h2>

      {Object.entries(groupedByCategory).map(([category, categoryEvents]) => (
        <div key={category} className="category-group">
          <div className="category-header">
            <img
              src={`/${categoryIcons[category as EventCategory]}`}
              alt={category}
              className="category-header-icon"
            />
            <h3 className="category-title">{category}</h3>
            <span className="category-count">({categoryEvents.length}件)</span>
          </div>

          <div className="category-events">
            {categoryEvents.map((event) => (
              <div
                key={event.id}
                className={`category-event-item ${selectedEventId === event.id ? 'selected' : ''}`}
                onClick={() => onEventSelect(event.id)}
              >
                <div className="event-header">
                  <div className="event-title">{event.title}</div>
                  <div className="event-header-actions">
                    {getStatusBadge(event.status)}
                    <button
                      className="share-link-button"
                      onClick={(e) => handleShareClick(e, event)}
                      title="詳細"
                    >
                      詳細
                    </button>
                  </div>
                </div>
                <div className="event-info">
                  <div className="event-date-time">
                    📅 {formatDate(event.date)} {formatTime(event.startTime, event.endTime)}
                  </div>
                  <div className="event-location">
                    📍 {event.location.name}
                  </div>
                </div>
                <div className="event-description">
                  {event.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {uncategorizedEvents.length > 0 && (
        <div className="category-group">
          <div className="category-header">
            <h3 className="category-title">未分類</h3>
            <span className="category-count">({uncategorizedEvents.length}件)</span>
          </div>

          <div className="category-events">
            {uncategorizedEvents.map((event) => (
              <div
                key={event.id}
                className={`category-event-item ${selectedEventId === event.id ? 'selected' : ''}`}
                onClick={() => onEventSelect(event.id)}
              >
                <div className="event-header">
                  <div className="event-title">{event.title}</div>
                  <div className="event-header-actions">
                    {getStatusBadge(event.status)}
                    <button
                      className="share-link-button"
                      onClick={(e) => handleShareClick(e, event)}
                      title="詳細"
                    >
                      詳細
                    </button>
                  </div>
                </div>
                <div className="event-info">
                  <div className="event-date-time">
                    📅 {formatDate(event.date)} {formatTime(event.startTime, event.endTime)}
                  </div>
                  <div className="event-location">
                    📍 {event.location.name}
                  </div>
                </div>
                <div className="event-description">
                  {event.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;

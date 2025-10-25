import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EventWithLocation, EventCategory } from '../types';
import './EventList.css';

interface EventListProps {
  events: EventWithLocation[];
  selectedEventId: string | null;
  onEventSelect: (eventId: string) => void;
}

const EventList: React.FC<EventListProps> = ({ events, selectedEventId, onEventSelect }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | ''>('');

  const getCategoryIcon = (category?: EventCategory | EventCategory[]) => {
    if (!category) return null;

    const categoryMap: Record<EventCategory, string> = {
      '伝統': 'zentradition.png',
      'ビジネス': 'zenbusiness.png',
      '対話': 'zendialogue.png',
      '展示': 'zenexhibition.png',
      '食': 'zenfood.png',
      '自然': 'zennatureact.png',
      'パフォーマンス': 'zenperformance.png',
      '体験': 'zenworkshop.png',
    };

    // 配列の場合は複数のカテゴリーを表示
    const categories = Array.isArray(category) ? category : [category];

    return (
      <div className="event-categories">
        {categories.map((cat) => (
          <div key={cat} className="event-category">
            <img src={`/${categoryMap[cat]}`} alt={cat} className="category-icon" />
            <span className="category-name">{cat}</span>
          </div>
        ))}
      </div>
    );
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
    return `${startTime} - ${endTime}`;
  };

  // 日付を正規化する関数（YYYY/MM/DD形式に統一）
  const normalizeDate = (dateString: string): string => {
    // YYYY-MM-DD形式をYYYY/MM/DD形式に変換
    return dateString.replace(/-/g, '/');
  };

  // カテゴリーの一覧を取得
  const categories: EventCategory[] = ['伝統', 'ビジネス', '対話', '展示', '食', '自然', 'パフォーマンス', '体験'];

  // 検索クエリとカテゴリーでイベントをフィルタリング
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // 検索クエリでフィルタリング
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query)
      );
    }

    // カテゴリーでフィルタリング
    if (selectedCategory) {
      filtered = filtered.filter(event => {
        if (!event.category) return false;
        // 配列の場合は選択されたカテゴリーが含まれているかチェック
        if (Array.isArray(event.category)) {
          return event.category.includes(selectedCategory);
        }
        // 単一カテゴリーの場合は一致するかチェック
        return event.category === selectedCategory;
      });
    }

    return filtered;
  }, [events, searchQuery, selectedCategory]);

  const groupedEvents = filteredEvents.reduce((groups, event) => {
    // 日付を正規化してグループ化
    const normalizedDate = normalizeDate(event.date);
    if (!groups[normalizedDate]) {
      groups[normalizedDate] = [];
    }
    groups[normalizedDate].push(event);
    return groups;
  }, {} as Record<string, EventWithLocation[]>);

  const handleShareClick = (e: React.MouseEvent, event: EventWithLocation) => {
    e.stopPropagation();
    if (event.eventUrl) {
      window.open(event.eventUrl, '_blank');
    } else {
      navigate(`/event/${event.id}`);
    }
  };

  return (
    <div className="event-list">
      <div className="event-filters">
        <div className="event-search">
          <input
            type="text"
            placeholder="イベントを検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery('')}
              title="検索をクリア"
            >
              ✕
            </button>
          )}
        </div>
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as EventCategory | '')}
            className="category-select"
          >
            <option value="">カテゴリーで絞る</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date} className="date-group">
          <h3 className="date-header">{formatDate(date)}</h3>
          {dateEvents.map((event) => (
            <div
              key={event.id}
              className={`event-item ${selectedEventId === event.id ? 'selected' : ''}`}
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
              <div className="event-time">
                {formatTime(event.startTime, event.endTime)}
              </div>
              <div className="event-location-category">
                <div className="event-location">
                  📍 {event.location.name}
                </div>
                {getCategoryIcon(event.category)}
              </div>
              <div className="event-description">
                {event.description}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default EventList;
import React from 'react';
import type { EventWithLocation } from '../types';
import './EventList.css';

interface EventListProps {
  events: EventWithLocation[];
  selectedEventId: string | null;
  onEventSelect: (eventId: string) => void;
}

const EventList: React.FC<EventListProps> = ({ events, selectedEventId, onEventSelect }) => {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      scheduled: { text: '予定', className: 'status-scheduled' },
      ongoing: { text: '進行中', className: 'status-ongoing' },
      completed: { text: '完了', className: 'status-completed' },
      cancelled: { text: 'キャンセル', className: 'status-cancelled' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.scheduled;
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

  const groupedEvents = events.reduce((groups, event) => {
    const date = event.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, EventWithLocation[]>);

  return (
    <div className="event-list">
      <h2>イベントスケジュール</h2>
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
                {getStatusBadge(event.status)}
              </div>
              <div className="event-time">
                {formatTime(event.startTime, event.endTime)}
              </div>
              <div className="event-location">
                📍 {event.location.name}
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
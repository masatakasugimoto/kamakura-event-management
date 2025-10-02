import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { EventWithLocation } from '../types';
import './EventList.css';
import './EventDetail.css';

interface EventDetailProps {
  events: EventWithLocation[];
  onEventSelect: (eventId: string) => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ events, onEventSelect }) => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = events.find(e => e.id === eventId);

  useEffect(() => {
    if (event) {
      onEventSelect(event.id);
    }
  }, [event, onEventSelect]);

  if (!event) {
    return (
      <div className="event-detail-container">
        <div className="event-not-found">
          <h2>イベントが見つかりません</h2>
          <button onClick={() => navigate('/')} className="back-button">
            イベント一覧に戻る
          </button>
        </div>
      </div>
    );
  }

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

  const shareUrl = window.location.href;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('URLをコピーしました！');
    });
  };

  return (
    <div className="event-detail-container">
      <div className="event-detail-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← イベント一覧に戻る
        </button>
        <button onClick={copyToClipboard} className="share-button">
          🔗 URLをコピー
        </button>
      </div>

      <div className="event-detail">
        <div className="event-header">
          <h1>{event.title}</h1>
          {getStatusBadge(event.status)}
        </div>

        <div className="event-info">
          <div className="info-item">
            <strong>📅 日時:</strong> {formatDate(event.date)} {formatTime(event.startTime, event.endTime)}
          </div>
          <div className="info-item">
            <strong>📍 場所:</strong> {event.location.name}
          </div>
          <div className="info-item">
            <strong>📝 説明:</strong>
            <p>{event.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

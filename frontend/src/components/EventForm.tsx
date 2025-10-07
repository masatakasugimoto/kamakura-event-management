import React, { useState, useEffect } from 'react';
import type { EventWithLocation, Location, Event } from '../types';
import './EventForm.css';

interface EventFormProps {
  event: EventWithLocation | null;
  locations: Location[];
  onSubmit: (eventData: Omit<Event, 'id'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EventForm: React.FC<EventFormProps> = ({
  event,
  locations,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<Omit<Event, 'id'>>({
    title: '',
    description: '',
    date: '2025-11-16',
    startTime: '10:00',
    endTime: '17:30',
    locationId: '',
    status: 'ticket_supported',
    category: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      // YYYY/MM/DD形式をYYYY-MM-DD形式に変換
      const formattedDate = event.date.replace(/\//g, '-');

      setFormData({
        title: event.title,
        description: event.description,
        date: formattedDate,
        startTime: event.startTime,
        endTime: event.endTime,
        locationId: event.locationId,
        status: event.status,
        category: event.category
      });
    }
  }, [event]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'イベント名は必須です';
    }

    if (!formData.description.trim()) {
      newErrors.description = '説明は必須です';
    }

    if (!formData.date) {
      newErrors.date = '日付は必須です';
    }

    if (!formData.startTime) {
      newErrors.startTime = '開始時間は必須です';
    }

    if (!formData.endTime) {
      newErrors.endTime = '終了時間は必須です';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01 ${formData.startTime}`);
      const end = new Date(`2000-01-01 ${formData.endTime}`);
      
      if (start >= end) {
        newErrors.endTime = '終了時間は開始時間より後である必要があります';
      }
    }

    if (!formData.locationId) {
      newErrors.locationId = '場所は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="event-form-container">
      <div className="event-form">
        <div className="form-header">
          <h3>{event ? 'イベントを編集' : '新しいイベントを作成'}</h3>
          <button className="close-button" onClick={onCancel} type="button">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">イベント名 *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? 'error' : ''}
              placeholder="例: AIといきがい"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">説明 *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="例: ランチしながらトークセッション聴講"
              rows={3}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">日付 *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'error' : ''}
                min={getTodayDate()}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="startTime">開始時間 *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className={errors.startTime ? 'error' : ''}
              />
              {errors.startTime && <span className="error-message">{errors.startTime}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endTime">終了時間 *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className={errors.endTime ? 'error' : ''}
              />
              {errors.endTime && <span className="error-message">{errors.endTime}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="locationId">場所 *</label>
              <select
                id="locationId"
                name="locationId"
                value={formData.locationId}
                onChange={handleInputChange}
                className={errors.locationId ? 'error' : ''}
              >
                <option value="">場所を選択してください</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              {errors.locationId && <span className="error-message">{errors.locationId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">ステータス</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="ticket_supported">通し券対応</option>
                <option value="ticket_not_supported">通し券未対応</option>
                <option value="finished">終了</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">カテゴリー</label>
            <select
              id="category"
              name="category"
              value={formData.category || ''}
              onChange={handleInputChange}
            >
              <option value="">カテゴリーを選択してください（任意）</option>
              <option value="伝統">伝統</option>
              <option value="ビジネス">ビジネス</option>
              <option value="対話">対話</option>
              <option value="展示">展示</option>
              <option value="食">食</option>
              <option value="自然">自然</option>
              <option value="パフォーマンス">パフォーマンス</option>
              <option value="体験">体験</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : (event ? '更新' : '作成')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
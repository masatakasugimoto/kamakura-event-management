import React, { useState, useEffect } from 'react';
import type { EventWithLocation, Location, Event, EventCategory } from '../types';
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
    category: undefined,
    eventUrl: ''
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
        category: event.category,
        eventUrl: event.eventUrl || ''
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

    // 場所は任意（Zoom開催などの場合は不要）

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

  const handleCategoryChange = (category: EventCategory) => {
    setFormData(prev => {
      const currentCategory = prev.category;

      // カテゴリーが未設定の場合
      if (!currentCategory) {
        return { ...prev, category: [category] };
      }

      // 単一カテゴリーの場合、配列に変換
      const categories = Array.isArray(currentCategory) ? currentCategory : [currentCategory];

      // すでに選択されている場合は削除、されていない場合は追加
      if (categories.includes(category)) {
        const updated = categories.filter(c => c !== category);
        return { ...prev, category: updated.length === 0 ? undefined : updated };
      } else {
        return { ...prev, category: [...categories, category] };
      }
    });
  };

  const isCategorySelected = (category: EventCategory): boolean => {
    if (!formData.category) return false;
    if (Array.isArray(formData.category)) {
      return formData.category.includes(category);
    }
    return formData.category === category;
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
              <label htmlFor="locationId">場所（オンライン開催の場合は不要）</label>
              <select
                id="locationId"
                name="locationId"
                value={formData.locationId || ''}
                onChange={handleInputChange}
                className={errors.locationId ? 'error' : ''}
              >
                <option value="">オンライン開催 / 場所未定</option>
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
            <label>カテゴリー（複数選択可）</label>
            <div className="category-checkboxes">
              {(['伝統', 'ビジネス', '対話', '展示', '食', '自然', 'パフォーマンス', '体験'] as EventCategory[]).map(category => (
                <label key={category} className="category-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isCategorySelected(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eventUrl">イベントURL（任意）</label>
            <input
              type="url"
              id="eventUrl"
              name="eventUrl"
              value={formData.eventUrl}
              onChange={handleInputChange}
              placeholder="例: https://example.com/event"
            />
            <small style={{ color: '#7f8c8d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              リンクボタンのジャンプ先として使用されます。未入力の場合はデフォルトのイベントページに移動します。
            </small>
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
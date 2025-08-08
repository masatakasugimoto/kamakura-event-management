import React, { useState, useEffect } from 'react';
import type { Location } from '../types';
import './LocationForm.css';

interface LocationFormProps {
  location: Location | null;
  onSubmit: (locationData: Omit<Location, 'id'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  location,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<Omit<Location, 'id'>>({
    name: '',
    address: '',
    lat: 35.3189,
    lng: 139.5477,
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        description: location.description || ''
      });
    }
  }, [location]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '場所名は必須です';
    }

    if (!formData.address.trim()) {
      newErrors.address = '住所は必須です';
    }

    if (isNaN(formData.lat) || formData.lat < -90 || formData.lat > 90) {
      newErrors.lat = '緯度は-90から90の間で入力してください';
    }

    if (isNaN(formData.lng) || formData.lng < -180 || formData.lng > 180) {
      newErrors.lng = '経度は-180から180の間で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'lat' || name === 'lng') {
      const numValue = parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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

  const handleAddressToCoords = () => {
    if (!formData.address.trim()) {
      alert('住所を入力してから座標を取得してください');
      return;
    }
    
    // 簡単なジオコーディング（実際のアプリではGoogle Geocoding APIなどを使用）
    const kamakuraLocations: Record<string, { lat: number; lng: number }> = {
      '鶴岡八幡宮': { lat: 35.3258, lng: 139.5556 },
      '長谷寺': { lat: 35.3128, lng: 139.5358 },
      '高徳院': { lat: 35.3167, lng: 139.5357 },
      '建長寺': { lat: 35.3378, lng: 139.5498 },
      '円覚寺': { lat: 35.3379, lng: 139.5481 }
    };

    for (const [name, coords] of Object.entries(kamakuraLocations)) {
      if (formData.address.includes(name) || formData.name.includes(name)) {
        setFormData(prev => ({ ...prev, lat: coords.lat, lng: coords.lng }));
        return;
      }
    }
    
    // デフォルトは鎌倉の中心部
    alert('該当する場所が見つかりませんでした。鎌倉中心部の座標を設定します。手動で調整してください。');
    setFormData(prev => ({ ...prev, lat: 35.3189, lng: 139.5477 }));
  };

  return (
    <div className="location-form-container">
      <div className="location-form">
        <div className="form-header">
          <h3>{location ? '場所を編集' : '新しい場所を追加'}</h3>
          <button className="close-button" onClick={onCancel} type="button">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">場所名 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              placeholder="例: 鶴岡八幡宮"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">住所 *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={errors.address ? 'error' : ''}
              placeholder="例: 神奈川県鎌倉市雪ノ下2-1-31"
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="coordinates-section">
            <div className="coordinates-header">
              <h4>座標情報</h4>
              <button
                type="button"
                className="coords-helper-button"
                onClick={handleAddressToCoords}
                disabled={isLoading}
              >
                🗺️ 住所から座標を取得
              </button>
            </div>
            
            <div className="coordinates-inputs">
              <div className="form-group">
                <label htmlFor="lat">緯度 *</label>
                <input
                  type="number"
                  id="lat"
                  name="lat"
                  value={formData.lat}
                  onChange={handleInputChange}
                  step="0.000001"
                  min="-90"
                  max="90"
                  className={errors.lat ? 'error' : ''}
                  placeholder="例: 35.325800"
                />
                {errors.lat && <span className="error-message">{errors.lat}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lng">経度 *</label>
                <input
                  type="number"
                  id="lng"
                  name="lng"
                  value={formData.lng}
                  onChange={handleInputChange}
                  step="0.000001"
                  min="-180"
                  max="180"
                  className={errors.lng ? 'error' : ''}
                  placeholder="例: 139.555600"
                />
                {errors.lng && <span className="error-message">{errors.lng}</span>}
              </div>
            </div>
            
            <div className="coordinates-info">
              💡 Google Mapsで場所を検索し、右クリック→座標をコピーして貼り付けることもできます
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">説明（任意）</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="例: 鎌倉を代表する神社"
              rows={3}
            />
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
              {isLoading ? '保存中...' : (location ? '更新' : '追加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationForm;
import React, { useState, useRef } from 'react';
import { dataManagementApi } from '../services/api';
import './DataManagement.css';

interface DataManagementProps {
  onDataUpdate: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onDataUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const eventsFileRef = useRef<HTMLInputElement>(null);
  const locationsFileRef = useRef<HTMLInputElement>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExportEventsCSV = async () => {
    try {
      setIsLoading(true);
      await dataManagementApi.exportEventsCSV();
      showMessage('success', 'イベントデータ（CSV）をエクスポートしました');
    } catch (error) {
      showMessage('error', `エクスポートエラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportLocationsCSV = async () => {
    try {
      setIsLoading(true);
      await dataManagementApi.exportLocationsCSV();
      showMessage('success', '場所データ（CSV）をエクスポートしました');
    } catch (error) {
      showMessage('error', `エクスポートエラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleFileRead = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          resolve(content);
        } catch (error) {
          reject(new Error('ファイルの読み込みに失敗しました'));
        }
      };
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
      reader.readAsText(file);
    });
  };

  const handleImportEvents = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('❌ CSVファイルのみ対応しています');
      if (eventsFileRef.current) {
        eventsFileRef.current.value = '';
      }
      return;
    }

    const confirmed = window.confirm(`${file.name}をインポートしますか？\n\n注意：既存のイベントデータは上書きされます。`);
    if (!confirmed) {
      if (eventsFileRef.current) {
        eventsFileRef.current.value = '';
      }
      return;
    }

    try {
      setIsLoading(true);
      const csvData = await handleFileRead(file);
      const result = await dataManagementApi.importEventsCSV(csvData);

      showMessage('success', result.message);
      alert(`✅ インポート完了\n\n${result.message}`);
      onDataUpdate();
    } catch (error) {
      const errorMessage = `インポートエラー: ${error instanceof Error ? error.message : 'Unknown error'}`;
      showMessage('error', errorMessage);
      alert(`❌ インポート失敗\n\n${errorMessage}`);
    } finally {
      setIsLoading(false);
      if (eventsFileRef.current) {
        eventsFileRef.current.value = '';
      }
    }
  };

  const handleImportLocations = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('❌ CSVファイルのみ対応しています');
      if (locationsFileRef.current) {
        locationsFileRef.current.value = '';
      }
      return;
    }

    const confirmed = window.confirm(`${file.name}をインポートしますか？\n\n注意：既存の場所データは上書きされます。`);
    if (!confirmed) {
      if (locationsFileRef.current) {
        locationsFileRef.current.value = '';
      }
      return;
    }

    try {
      setIsLoading(true);
      const csvData = await handleFileRead(file);
      const result = await dataManagementApi.importLocationsCSV(csvData);

      showMessage('success', result.message);
      alert(`✅ インポート完了\n\n${result.message}`);
      onDataUpdate();
    } catch (error) {
      const errorMessage = `インポートエラー: ${error instanceof Error ? error.message : 'Unknown error'}`;
      showMessage('error', errorMessage);
      alert(`❌ インポート失敗\n\n${errorMessage}`);
    } finally {
      setIsLoading(false);
      if (locationsFileRef.current) {
        locationsFileRef.current.value = '';
      }
    }
  };


  return (
    <div className="data-management">
      <div className="data-management-header">
        <h3>📊 データ管理</h3>
        <p>イベントと場所のデータをエクスポート・インポートできます</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="data-management-section">
        <h4>📤 エクスポート（CSV形式）</h4>
        <div className="export-buttons">
          <button
            onClick={handleExportEventsCSV}
            disabled={isLoading}
            className="export-button events"
          >
            📅 イベントをエクスポート
          </button>
          <button
            onClick={handleExportLocationsCSV}
            disabled={isLoading}
            className="export-button locations"
          >
            📍 場所をエクスポート
          </button>
        </div>
      </div>

      <div className="data-management-section">
        <h4>📥 インポート（CSV形式）</h4>
        <div className="import-section">
          <div className="import-item">
            <label className="import-label">
              📅 イベントをインポート（CSV）
              <input
                type="file"
                ref={eventsFileRef}
                onChange={handleImportEvents}
                accept=".csv"
                disabled={isLoading}
              />
            </label>
          </div>
          <div className="import-item">
            <label className="import-label">
              📍 場所をインポート（CSV）
              <input
                type="file"
                ref={locationsFileRef}
                onChange={handleImportLocations}
                accept=".csv"
                disabled={isLoading}
              />
            </label>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>処理中...</p>
        </div>
      )}
    </div>
  );
};

export default DataManagement;
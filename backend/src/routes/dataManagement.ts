import express from 'express';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import * as createCsvWriter from 'csv-writer';
import type { Event, Location } from '../types';

const router = express.Router();

// エクスポート機能
router.get('/export/events', (req, res) => {
  try {
    const eventsPath = path.join(__dirname, '../../data/events.json');
    const eventsData = fs.readFileSync(eventsPath, 'utf8');
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="events_export.json"');
    res.send(eventsData);
  } catch (error) {
    console.error('イベントエクスポートエラー:', error);
    res.status(500).json({ error: 'イベントのエクスポートに失敗しました' });
  }
});

router.get('/export/locations', (req, res) => {
  try {
    const locationsPath = path.join(__dirname, '../../data/locations.json');
    const locationsData = fs.readFileSync(locationsPath, 'utf8');
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="locations_export.json"');
    res.send(locationsData);
  } catch (error) {
    console.error('場所エクスポートエラー:', error);
    res.status(500).json({ error: '場所のエクスポートに失敗しました' });
  }
});

router.get('/export/all', (req, res) => {
  try {
    const eventsPath = path.join(__dirname, '../../data/events.json');
    const locationsPath = path.join(__dirname, '../../data/locations.json');
    
    const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
    const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
    
    const exportData = {
      events: eventsData,
      locations: locationsData,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="all_data_export.json"');
    res.json(exportData);
  } catch (error) {
    console.error('全データエクスポートエラー:', error);
    res.status(500).json({ error: '全データのエクスポートに失敗しました' });
  }
});

// インポート機能
router.post('/import/events', (req, res) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events)) {
      return res.status(400).json({ error: 'イベントデータは配列である必要があります' });
    }

    // データの検証
    for (const event of events) {
      if (!event.id || !event.title || !event.date) {
        return res.status(400).json({ error: '必須フィールド（id, title, date）が不足しているイベントがあります' });
      }
    }

    const eventsPath = path.join(__dirname, '../../data/events.json');
    fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
    
    res.json({ 
      success: true, 
      message: `${events.length}件のイベントをインポートしました`,
      count: events.length
    });
  } catch (error) {
    console.error('イベントインポートエラー:', error);
    res.status(500).json({ error: 'イベントのインポートに失敗しました' });
  }
});

router.post('/import/locations', (req, res) => {
  try {
    const { locations } = req.body;
    
    if (!Array.isArray(locations)) {
      return res.status(400).json({ error: '場所データは配列である必要があります' });
    }

    // データの検証
    for (const location of locations) {
      if (!location.id || !location.name || location.lat === undefined || location.lng === undefined) {
        return res.status(400).json({ error: '必須フィールド（id, name, lat, lng）が不足している場所があります' });
      }
    }

    const locationsPath = path.join(__dirname, '../../data/locations.json');
    fs.writeFileSync(locationsPath, JSON.stringify(locations, null, 2));
    
    res.json({ 
      success: true, 
      message: `${locations.length}件の場所をインポートしました`,
      count: locations.length
    });
  } catch (error) {
    console.error('場所インポートエラー:', error);
    res.status(500).json({ error: '場所のインポートに失敗しました' });
  }
});

router.post('/import/all', (req, res) => {
  try {
    const { events, locations } = req.body;
    
    if (!Array.isArray(events) || !Array.isArray(locations)) {
      return res.status(400).json({ error: 'イベントと場所のデータは配列である必要があります' });
    }

    // イベントデータの検証
    for (const event of events) {
      if (!event.id || !event.title || !event.date) {
        return res.status(400).json({ error: '必須フィールドが不足しているイベントがあります' });
      }
    }

    // 場所データの検証
    for (const location of locations) {
      if (!location.id || !location.name || location.lat === undefined || location.lng === undefined) {
        return res.status(400).json({ error: '必須フィールドが不足している場所があります' });
      }
    }

    const eventsPath = path.join(__dirname, '../../data/events.json');
    const locationsPath = path.join(__dirname, '../../data/locations.json');
    
    fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
    fs.writeFileSync(locationsPath, JSON.stringify(locations, null, 2));
    
    res.json({ 
      success: true, 
      message: `${events.length}件のイベントと${locations.length}件の場所をインポートしました`,
      eventsCount: events.length,
      locationsCount: locations.length
    });
  } catch (error) {
    console.error('全データインポートエラー:', error);
    res.status(500).json({ error: '全データのインポートに失敗しました' });
  }
});

// CSV エクスポート機能
router.get('/export/events/csv', async (req, res) => {
  try {
    const eventsPath = path.join(__dirname, '../../data/events.json');
    const locationsPath = path.join(__dirname, '../../data/locations.json');
    const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
    const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
    
    // 場所IDから場所名への変換マップを作成
    const locationMap = new Map(locationsData.map((loc: Location) => [loc.id, loc.name]));
    
    const csvWriter = createCsvWriter.createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'title', title: 'タイトル' },
        { id: 'description', title: '説明' },
        { id: 'date', title: '日付' },
        { id: 'startTime', title: '開始時間' },
        { id: 'endTime', title: '終了時間' },
        { id: 'locationId', title: '場所ID' },
        { id: 'locationName', title: '場所名' },
        { id: 'status', title: 'ステータス' }
      ]
    });
    
    const records = eventsData.map((event: Event) => ({
      ...event,
      locationName: locationMap.get(event.locationId) || ''
    }));
    
    const csvString = csvWriter.getHeaderString() + csvWriter.stringifyRecords(records);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="events_export.csv"');
    res.send('\ufeff' + csvString); // BOMを追加してExcelで文字化け防止
  } catch (error) {
    console.error('イベントCSVエクスポートエラー:', error);
    res.status(500).json({ error: 'イベントのCSVエクスポートに失敗しました' });
  }
});

router.get('/export/locations/csv', async (req, res) => {
  try {
    const locationsPath = path.join(__dirname, '../../data/locations.json');
    const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
    
    const csvWriter = createCsvWriter.createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: '場所名' },
        { id: 'address', title: '住所' },
        { id: 'lat', title: '緯度' },
        { id: 'lng', title: '経度' },
        { id: 'description', title: '説明' }
      ]
    });
    
    const csvString = csvWriter.getHeaderString() + csvWriter.stringifyRecords(locationsData);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="locations_export.csv"');
    res.send('\ufeff' + csvString); // BOMを追加してExcelで文字化け防止
  } catch (error) {
    console.error('場所CSVエクスポートエラー:', error);
    res.status(500).json({ error: '場所のCSVエクスポートに失敗しました' });
  }
});

// CSV インポート機能
router.post('/import/events/csv', async (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'CSVデータが必要です' });
    }

    const events: Event[] = [];
    const csvLines = csvData.trim().split('\n');
    
    if (csvLines.length < 2) {
      return res.status(400).json({ error: 'CSVデータが空または不正です' });
    }
    
    // ヘッダー行を解析
    const headers = csvLines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // データ行を処理
    for (let i = 1; i < csvLines.length; i++) {
      const values = csvLines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length < headers.length) continue;
      
      const event: any = {};
      headers.forEach((header, index) => {
        switch (header) {
          case 'ID':
            // 科学的記数法の値を正しい文字列に変換
            let idValue = values[index];
            if (idValue.includes('E+') || idValue.includes('e+')) {
              const num = parseFloat(idValue);
              idValue = Math.round(num).toString();
            }
            event.id = idValue;
            break;
          case 'タイトル':
            event.title = values[index];
            break;
          case '説明':
            event.description = values[index];
            break;
          case '日付':
            event.date = values[index];
            break;
          case '開始時間':
            event.startTime = values[index];
            break;
          case '終了時間':
            event.endTime = values[index];
            break;
          case '場所ID':
            // 科学的記数法の値を正しい文字列に変換
            let locationIdValue = values[index];
            if (locationIdValue.includes('E+') || locationIdValue.includes('e+')) {
              const num = parseFloat(locationIdValue);
              locationIdValue = Math.round(num).toString();
            }
            event.locationId = locationIdValue;
            break;
          case 'ステータス':
            event.status = values[index];
            break;
        }
      });
      
      if (event.id && event.title && event.date) {
        events.push(event);
      }
    }
    
    if (events.length === 0) {
      return res.status(400).json({ error: '有効なイベントデータが見つかりませんでした' });
    }

    const eventsPath = path.join(__dirname, '../../data/events.json');
    fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
    
    res.json({ 
      success: true, 
      message: `${events.length}件のイベントをインポートしました`,
      count: events.length
    });
  } catch (error) {
    console.error('イベントCSVインポートエラー:', error);
    res.status(500).json({ error: 'イベントのCSVインポートに失敗しました' });
  }
});

router.post('/import/locations/csv', async (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'CSVデータが必要です' });
    }

    const locations: Location[] = [];
    const csvLines = csvData.trim().split('\n');
    
    if (csvLines.length < 2) {
      return res.status(400).json({ error: 'CSVデータが空または不正です' });
    }
    
    // ヘッダー行を解析
    const headers = csvLines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // データ行を処理
    for (let i = 1; i < csvLines.length; i++) {
      const values = csvLines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length < headers.length) continue;
      
      const location: any = {};
      headers.forEach((header, index) => {
        switch (header) {
          case 'ID':
            // 科学的記数法の値を正しい文字列に変換
            let idValue = values[index];
            if (idValue.includes('E+') || idValue.includes('e+')) {
              const num = parseFloat(idValue);
              idValue = Math.round(num).toString();
            }
            location.id = idValue;
            break;
          case '場所名':
            location.name = values[index];
            break;
          case '住所':
            location.address = values[index];
            break;
          case '緯度':
            location.lat = parseFloat(values[index]);
            break;
          case '経度':
            location.lng = parseFloat(values[index]);
            break;
          case '説明':
            location.description = values[index];
            break;
        }
      });
      
      if (location.id && location.name && !isNaN(location.lat) && !isNaN(location.lng)) {
        locations.push(location);
      }
    }
    
    if (locations.length === 0) {
      return res.status(400).json({ error: '有効な場所データが見つかりませんでした' });
    }

    const locationsPath = path.join(__dirname, '../../data/locations.json');
    fs.writeFileSync(locationsPath, JSON.stringify(locations, null, 2));
    
    res.json({ 
      success: true, 
      message: `${locations.length}件の場所をインポートしました`,
      count: locations.length
    });
  } catch (error) {
    console.error('場所CSVインポートエラー:', error);
    res.status(500).json({ error: '場所のCSVインポートに失敗しました' });
  }
});

export default router;
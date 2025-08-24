import fs from 'fs';
import path from 'path';
import { createIdMapping, isNewIdFormat } from '../utils/idGenerator';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  status: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
}

function convertEventIds() {
  const eventsPath = path.join(__dirname, '../../data/events.json');
  const locationsPath = path.join(__dirname, '../../data/locations.json');
  
  try {
    // データを読み込み
    const eventsData: Event[] = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
    const locationsData: Location[] = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
    
    console.log('現在のデータ状況:');
    console.log(`- イベント数: ${eventsData.length}`);
    console.log(`- 場所数: ${locationsData.length}`);
    
    // イベントIDの変換マッピングを作成
    const existingEventIds = eventsData.map(event => event.id);
    const eventIdMapping = createIdMapping(existingEventIds);
    
    // 場所IDの変換マッピングを作成
    const existingLocationIds = locationsData.map(location => location.id);
    const locationIdMapping = createIdMapping(existingLocationIds);
    
    console.log('\nID変換マッピング:');
    console.log('イベントID変換:');
    eventIdMapping.forEach((newId, oldId) => {
      console.log(`  ${oldId} -> ${newId}`);
    });
    
    console.log('場所ID変換:');
    locationIdMapping.forEach((newId, oldId) => {
      console.log(`  ${oldId} -> ${newId}`);
    });
    
    // イベントデータを変換
    const convertedEvents = eventsData.map((event, index) => {
      const newEventId = eventIdMapping.get(event.id) || event.id;
      const newLocationId = locationIdMapping.get(event.locationId) || event.locationId;
      
      return {
        ...event,
        id: newEventId,
        locationId: newLocationId
      };
    });
    
    // 場所データを変換
    const convertedLocations = locationsData.map((location, index) => {
      const newLocationId = locationIdMapping.get(location.id) || location.id;
      
      return {
        ...location,
        id: newLocationId
      };
    });
    
    // バックアップを作成
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
      path.join(__dirname, `../../data/events_backup_${timestamp}.json`),
      JSON.stringify(eventsData, null, 2)
    );
    fs.writeFileSync(
      path.join(__dirname, `../../data/locations_backup_${timestamp}.json`),
      JSON.stringify(locationsData, null, 2)
    );
    
    // 新しいデータを保存
    fs.writeFileSync(eventsPath, JSON.stringify(convertedEvents, null, 2));
    fs.writeFileSync(locationsPath, JSON.stringify(convertedLocations, null, 2));
    
    console.log('\n変換完了:');
    console.log(`- バックアップファイル作成: events_backup_${timestamp}.json`);
    console.log(`- バックアップファイル作成: locations_backup_${timestamp}.json`);
    console.log('- IDが新形式に変換されました');
    
  } catch (error) {
    console.error('ID変換エラー:', error);
  }
}

// スクリプトを直接実行する場合
if (require.main === module) {
  convertEventIds();
}

export { convertEventIds };
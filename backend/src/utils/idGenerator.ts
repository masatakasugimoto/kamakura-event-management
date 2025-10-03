import fs from 'fs';
import path from 'path';

// ID生成の仕様
// - 1-9件まで: 1桁の連番 (1, 2, 3, ..., 9)
// - 10件以上: 2桁の連番 (10, 11, 12, ...)

export function generateEventId(): string {
  const eventsPath = path.join(__dirname, '../../data/events.json');

  try {
    const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

    // 既存のIDを数値に変換し、重複を除外
    const existingIds = eventsData
      .map((event: any) => parseInt(event.id, 10))
      .filter((id: number) => !isNaN(id));

    // 既存IDが存在しない場合は1から開始
    if (existingIds.length === 0) {
      return '1';
    }

    // 最大IDを取得して+1
    const maxId = Math.max(...existingIds);
    const nextId = maxId + 1;

    return nextId.toString();
  } catch (error) {
    // ファイルが存在しない場合は1から開始
    return '1';
  }
}

export function generateLocationId(): string {
  const locationsPath = path.join(__dirname, '../../data/locations.json');

  try {
    const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

    // 既存のIDを数値に変換し、重複を除外
    const existingIds = locationsData
      .map((location: any) => parseInt(location.id, 10))
      .filter((id: number) => !isNaN(id));

    // 既存IDが存在しない場合は1から開始
    if (existingIds.length === 0) {
      return '1';
    }

    // 最大IDを取得して+1
    const maxId = Math.max(...existingIds);
    const nextId = maxId + 1;

    return nextId.toString();
  } catch (error) {
    // ファイルが存在しない場合は1から開始
    return '1';
  }
}

// 既存のIDが新しい形式かどうかをチェック
export function isNewIdFormat(id: string): boolean {
  // 新しい形式は1-2桁の数字のみ
  return /^\d{1,2}$/.test(id);
}

// 大きなIDを新しい形式に変換するマッピングを作成
export function createIdMapping(existingIds: string[]): Map<string, string> {
  const mapping = new Map<string, string>();
  
  existingIds.forEach((oldId, index) => {
    if (!isNewIdFormat(oldId)) {
      const newId = (index + 1).toString();
      mapping.set(oldId, newId);
    }
  });
  
  return mapping;
}
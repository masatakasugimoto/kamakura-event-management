/**
 * 既存のイベントデータの日付フォーマットを統一するスクリプト
 * YYYY-MM-DD形式をYYYY/MM/DD形式に変換
 */

import fs from 'fs';
import path from 'path';
import { Event } from '../types';

const eventsPath = path.join(__dirname, '../../data/events.json');

function normalizeDateFormat(dateString: string): string {
  if (!dateString) {
    return dateString;
  }
  // YYYY-MM-DD形式をYYYY/MM/DD形式に変換
  return dateString.replace(/-/g, '/');
}

function normalizeEventsData() {
  try {
    // イベントデータを読み込み
    const eventsData = fs.readFileSync(eventsPath, 'utf-8');
    const events: Event[] = JSON.parse(eventsData);

    // 日付を正規化
    const normalizedEvents = events.map(event => ({
      ...event,
      date: normalizeDateFormat(event.date)
    }));

    // 変更されたイベント数をカウント
    let changedCount = 0;
    events.forEach((event, index) => {
      if (event.date !== normalizedEvents[index].date) {
        console.log(`Updated: ${event.id} - "${event.date}" → "${normalizedEvents[index].date}"`);
        changedCount++;
      }
    });

    // ファイルに書き戻し
    fs.writeFileSync(eventsPath, JSON.stringify(normalizedEvents, null, 2));

    console.log(`\n✅ Date normalization completed!`);
    console.log(`Total events: ${events.length}`);
    console.log(`Updated events: ${changedCount}`);
    console.log(`Unchanged events: ${events.length - changedCount}`);
  } catch (error) {
    console.error('❌ Error normalizing dates:', error);
    process.exit(1);
  }
}

// スクリプト実行
normalizeEventsData();

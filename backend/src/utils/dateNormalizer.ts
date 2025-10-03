/**
 * 日付フォーマットを統一するユーティリティ
 * すべての日付を YYYY/MM/DD 形式に正規化
 */

/**
 * 日付文字列を YYYY/MM/DD 形式に正規化
 * @param dateString 入力日付文字列（YYYY-MM-DD または YYYY/MM/DD）
 * @returns 正規化された日付文字列（YYYY/MM/DD）
 */
export function normalizeDateFormat(dateString: string): string {
  if (!dateString) {
    return dateString;
  }

  // YYYY-MM-DD形式をYYYY/MM/DD形式に変換
  return dateString.replace(/-/g, '/');
}

/**
 * イベントオブジェクトの日付を正規化
 * @param event イベントオブジェクト
 * @returns 日付が正規化されたイベントオブジェクト
 */
export function normalizeEventDate<T extends { date: string }>(event: T): T {
  return {
    ...event,
    date: normalizeDateFormat(event.date)
  };
}

export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
}

export type EventCategory = '伝統' | 'ビジネス' | '対話' | '展示' | '食' | '自然' | 'パフォーマンス' | '体験';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  locationId?: string;
  status: 'ticket_supported' | 'ticket_not_supported' | 'finished';
  category?: EventCategory | EventCategory[];
  eventUrl?: string;
}

export interface EventWithLocation extends Event {
  location?: Location;
}
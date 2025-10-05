export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
}

export type EventCategory = '伝統' | 'ビジネス' | '対話' | '体験' | '食' | '自然' | 'パフォーマンス';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  locationId: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  category?: EventCategory;
}

export interface EventWithLocation extends Event {
  location: Location;
}
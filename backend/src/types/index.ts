export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  locationId: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventWithLocation extends Event {
  location: Location;
}
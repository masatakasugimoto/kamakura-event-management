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
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  status: 'ticket_supported' | 'ticket_not_supported' | 'finished';
}

export interface EventWithLocation extends Event {
  location: Location;
}
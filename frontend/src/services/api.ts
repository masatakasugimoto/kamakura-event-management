import type { EventWithLocation, Location, Event } from '../types';

const API_BASE_URL = '/api';

export const eventApi = {
  getAll: async (): Promise<EventWithLocation[]> => {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return response.json();
  },

  getById: async (id: string): Promise<EventWithLocation> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    return response.json();
  },

  create: async (event: Omit<Event, 'id'>): Promise<Event> => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    return response.json();
  },

  update: async (id: string, event: Partial<Event>): Promise<Event> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error('Failed to update event');
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
  },
};

export const locationApi = {
  getAll: async (): Promise<Location[]> => {
    const response = await fetch(`${API_BASE_URL}/locations`);
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }
    return response.json();
  },

  getById: async (id: string): Promise<Location> => {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    return response.json();
  },

  create: async (location: Omit<Location, 'id'>): Promise<Location> => {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });
    if (!response.ok) {
      throw new Error('Failed to create location');
    }
    return response.json();
  },

  update: async (id: string, location: Partial<Location>): Promise<Location> => {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });
    if (!response.ok) {
      throw new Error('Failed to update location');
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete location');
    }
  },
};

export const dataManagementApi = {
  // CSV エクスポート
  exportEventsCSV: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/data/export/events/csv`);
    if (!response.ok) {
      throw new Error('Failed to export events CSV');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'events_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  exportLocationsCSV: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/data/export/locations/csv`);
    if (!response.ok) {
      throw new Error('Failed to export locations CSV');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'locations_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // CSV インポート
  importEventsCSV: async (csvData: string): Promise<{ success: boolean; message: string; count?: number; total?: number; added?: number; updated?: number; unchanged?: number }> => {
    const response = await fetch(`${API_BASE_URL}/data/import/events/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ csvData }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to import events CSV');
    }
    return response.json();
  },

  importLocationsCSV: async (csvData: string): Promise<{ success: boolean; message: string; count?: number; total?: number; added?: number; updated?: number; unchanged?: number }> => {
    const response = await fetch(`${API_BASE_URL}/data/import/locations/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ csvData }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to import locations CSV');
    }
    return response.json();
  },
};
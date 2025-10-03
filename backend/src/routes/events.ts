import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { generateEventId } from '../utils/idGenerator';
import { normalizeEventDate } from '../utils/dateNormalizer';
import { Event, Location, EventWithLocation } from '../types';

const router = Router();
const eventsPath = path.join(__dirname, '../../data/events.json');
const locationsPath = path.join(__dirname, '../../data/locations.json');

const readEvents = (): Event[] => {
  const data = fs.readFileSync(eventsPath, 'utf-8');
  return JSON.parse(data);
};

const readLocations = (): Location[] => {
  const data = fs.readFileSync(locationsPath, 'utf-8');
  return JSON.parse(data);
};

const writeEvents = (events: Event[]) => {
  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
};

router.get('/', (req, res) => {
  try {
    const events = readEvents();
    const locations = readLocations();
    
    const eventsWithLocation: EventWithLocation[] = events
      .map(event => {
        const location = locations.find(loc => loc.id === event.locationId);
        if (!location) {
          console.warn(`Warning: Location not found for event ${event.id} (locationId: ${event.locationId})`);
          return null;
        }
        return { ...event, location };
      })
      .filter((event): event is EventWithLocation => event !== null);

    const sortedEvents = eventsWithLocation.sort((a, b) => {
      // 日付を数値に変換（YYYYMMDD形式）
      const parseDate = (date: string) => {
        if (date === '未定' || !date) return 99991231; // 未定は最後に表示
        
        const normalizedDate = date.replace(/\//g, '-'); // 2025/11/16 → 2025-11-16
        const parts = normalizedDate.split('-');
        
        if (parts.length === 3) {
          const year = parseInt(parts[0]) || 9999;
          const month = parseInt(parts[1]) || 12;
          const day = parseInt(parts[2]) || 31;
          return year * 10000 + month * 100 + day;
        }
        return 99991231;
      };

      // 時間を分単位の数値に変換
      const parseTime = (time: string) => {
        if (!time || time === '' || time === '0:00' || time.includes('未定')) {
          return 1439; // 23:59 = 23*60 + 59 時間未記載は同日の最後に表示
        }
        
        const cleanTime = time.split('.')[0];
        const timeParts = cleanTime.split(':');
        
        const hour = parseInt(timeParts[0]) || 0;
        const minute = parseInt(timeParts[1]) || 0;
        
        return hour * 60 + minute;
      };

      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      
      // 日付での比較
      if (dateA !== dateB) {
        return dateA - dateB;
      }

      // 同じ日付の場合、時間で比較
      const timeA = parseTime(a.startTime);
      const timeB = parseTime(b.startTime);
      
      return timeA - timeB;
    });

    res.json(sortedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const events = readEvents();
    const locations = readLocations();
    const event = events.find(e => e.id === req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const location = locations.find(loc => loc.id === event.locationId);
    if (!location) {
      return res.status(500).json({ error: 'Location not found for event' });
    }

    res.json({ ...event, location });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

router.post('/', (req, res) => {
  try {
    const events = readEvents();
    const newEvent: Event = normalizeEventDate({
      id: generateEventId(),
      ...req.body
    });

    events.push(newEvent);
    writeEvents(events);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const events = readEvents();
    const eventIndex = events.findIndex(e => e.id === req.params.id);

    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    events[eventIndex] = normalizeEventDate({
      ...events[eventIndex],
      ...req.body
    });
    writeEvents(events);
    res.json(events[eventIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const events = readEvents();
    const filteredEvents = events.filter(e => e.id !== req.params.id);
    
    if (events.length === filteredEvents.length) {
      return res.status(404).json({ error: 'Event not found' });
    }

    writeEvents(filteredEvents);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
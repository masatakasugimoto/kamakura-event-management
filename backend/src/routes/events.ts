import { Router } from 'express';
import fs from 'fs';
import path from 'path';
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
    
    const eventsWithLocation: EventWithLocation[] = events.map(event => {
      const location = locations.find(loc => loc.id === event.locationId);
      if (!location) {
        throw new Error(`Location not found for event ${event.id}`);
      }
      return { ...event, location };
    });

    const sortedEvents = eventsWithLocation.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    res.json(sortedEvents);
  } catch (error) {
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
    const newEvent: Event = {
      id: Date.now().toString(),
      ...req.body
    };
    
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

    events[eventIndex] = { ...events[eventIndex], ...req.body };
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
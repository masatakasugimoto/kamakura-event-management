import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { generateLocationId } from '../utils/idGenerator';
import { Location } from '../types';

const router = Router();
const locationsPath = path.join(__dirname, '../../data/locations.json');

const readLocations = (): Location[] => {
  const data = fs.readFileSync(locationsPath, 'utf-8');
  return JSON.parse(data);
};

const writeLocations = (locations: Location[]) => {
  fs.writeFileSync(locationsPath, JSON.stringify(locations, null, 2));
};

router.get('/', (req, res) => {
  try {
    const locations = readLocations();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const locations = readLocations();
    const location = locations.find(l => l.id === req.params.id);
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

router.post('/', (req, res) => {
  try {
    const locations = readLocations();
    const newLocation: Location = {
      id: generateLocationId(),
      ...req.body
    };
    
    locations.push(newLocation);
    writeLocations(locations);
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create location' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const locations = readLocations();
    const locationIndex = locations.findIndex(l => l.id === req.params.id);
    
    if (locationIndex === -1) {
      return res.status(404).json({ error: 'Location not found' });
    }

    locations[locationIndex] = { ...locations[locationIndex], ...req.body };
    writeLocations(locations);
    res.json(locations[locationIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const locations = readLocations();
    const filteredLocations = locations.filter(l => l.id !== req.params.id);
    
    if (locations.length === filteredLocations.length) {
      return res.status(404).json({ error: 'Location not found' });
    }

    writeLocations(filteredLocations);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

export default router;
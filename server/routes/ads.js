const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Duration to days mapping
const DURATION_DAYS = {
  '1-week': 7,
  '2-weeks': 14,
  '1-month': 30,
  '2-months': 60,
  '3-months': 90
};

// GET /api/ads - Get all approved ads (public)
router.get('/', (req, res) => {
  try {
    const now = new Date().toISOString();
    
    const ads = db.prepare(`
      SELECT * FROM ads 
      WHERE status = 'approved' AND expires_at > ?
      ORDER BY created_at DESC
    `).all(now);
    
    // Add full image URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const adsWithUrls = ads.map(ad => ({
      ...ad,
      image_url: `${baseUrl}/uploads/${ad.image_path}`
    }));
    
    res.json({ ads: adsWithUrls });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

// POST /api/ads - Submit a new ad (public)
router.post('/', upload.single('image'), (req, res) => {
  try {
    const { store_name, title, description, country, category, duration, email } = req.body;
    
    // Validation
    if (!store_name || !title || !description || !country || !category || !duration || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Sanitize inputs
    const sanitizedData = {
      store_name: store_name.trim().substring(0, 100),
      title: title.trim().substring(0, 200),
      description: description.trim().substring(0, 2000),
      country: country.trim().substring(0, 100),
      category: category.trim().substring(0, 50),
      duration: duration.trim(),
      email: email.trim().toLowerCase().substring(0, 100)
    };
    
    // Calculate dates
    const createdAt = new Date();
    const daysToAdd = DURATION_DAYS[sanitizedData.duration] || 30;
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + daysToAdd);
    
    // Create ad
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO ads (id, store_name, title, description, country, category, duration, image_path, email, status, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(
      id,
      sanitizedData.store_name,
      sanitizedData.title,
      sanitizedData.description,
      sanitizedData.country,
      sanitizedData.category,
      sanitizedData.duration,
      req.file.filename,
      sanitizedData.email,
      createdAt.toISOString(),
      expiresAt.toISOString()
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Ad submitted successfully and is pending approval',
      id 
    });
  } catch (error) {
    console.error('Error submitting ad:', error);
    res.status(500).json({ error: 'Failed to submit ad' });
  }
});

module.exports = router;

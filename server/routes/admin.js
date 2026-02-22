const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/init');
const { generateToken, authMiddleware, verifyToken } = require('../middleware/auth');
const { deleteFile } = require('../middleware/upload');

const router = express.Router();

// Helper to get the base URL (works with ngrok/cloudflare tunnels)
function getBaseUrl(req) {
  const forwardedProto = req.headers['x-forwarded-proto'] || req.protocol;
  const forwardedHost = req.headers['x-forwarded-host'] || req.headers['host'];
  return `${forwardedProto}://${forwardedHost}`;
}

// POST /api/admin/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username);
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = bcrypt.compareSync(password, admin.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken({ 
      id: admin.id, 
      username: admin.username,
      role: 'admin' 
    });
    
    console.log(`Admin logged in: ${username}`);
    
    res.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/admin/validate
router.get('/validate', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ valid: false });
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  res.json({ valid: !!decoded });
});

// GET /api/admin/ads - Get all ads (protected)
router.get('/ads', authMiddleware, (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    
    const pending = db.prepare(`
      SELECT * FROM ads WHERE status = 'pending' ORDER BY created_at DESC
    `).all().map(ad => ({
      ...ad,
      image_url: `${baseUrl}/uploads/${ad.image_path}`
    }));
    
    const approved = db.prepare(`
      SELECT * FROM ads WHERE status = 'approved' ORDER BY created_at DESC
    `).all().map(ad => ({
      ...ad,
      image_url: `${baseUrl}/uploads/${ad.image_path}`
    }));
    
    res.json({ pending, approved });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

// GET /api/admin/ads/pending
router.get('/ads/pending', authMiddleware, (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    
    const ads = db.prepare(`
      SELECT * FROM ads WHERE status = 'pending' ORDER BY created_at DESC
    `).all().map(ad => ({
      ...ad,
      image_url: `${baseUrl}/uploads/${ad.image_path}`
    }));
    
    res.json({ ads });
  } catch (error) {
    console.error('Error fetching pending ads:', error);
    res.status(500).json({ error: 'Failed to fetch pending ads' });
  }
});

// PUT /api/admin/ads/:id/approve
router.put('/ads/:id/approve', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    const ad = db.prepare('SELECT * FROM ads WHERE id = ?').get(id);
    
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    db.prepare('UPDATE ads SET status = ? WHERE id = ?').run('approved', id);
    
    console.log(`Ad approved: "${ad.title}"`);
    
    res.json({ success: true, message: 'Ad approved successfully' });
  } catch (error) {
    console.error('Error approving ad:', error);
    res.status(500).json({ error: 'Failed to approve ad' });
  }
});

// DELETE /api/admin/ads/:id
router.delete('/ads/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    const ad = db.prepare('SELECT * FROM ads WHERE id = ?').get(id);
    
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    // Delete the image file
    if (ad.image_path) {
      deleteFile(ad.image_path);
    }
    
    // Delete from database
    db.prepare('DELETE FROM ads WHERE id = ?').run(id);
    
    console.log(`Ad deleted: "${ad.title}"`);
    
    res.json({ success: true, message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ error: 'Failed to delete ad' });
  }
});

// PUT /api/admin/password
router.put('/password', authMiddleware, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    const admin = db.prepare('SELECT * FROM admin WHERE id = ?').get(req.admin.id);
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    const isValidPassword = bcrypt.compareSync(currentPassword, admin.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const newHash = bcrypt.hashSync(newPassword, 10);
    
    db.prepare('UPDATE admin SET password_hash = ?, updated_at = ? WHERE id = ?')
      .run(newHash, new Date().toISOString(), admin.id);
    
    console.log('Admin password changed');
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// GET /api/admin/stats
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const now = new Date().toISOString();
    
    const totalAds = db.prepare('SELECT COUNT(*) as count FROM ads').get().count;
    const pendingAds = db.prepare("SELECT COUNT(*) as count FROM ads WHERE status = 'pending'").get().count;
    const approvedAds = db.prepare("SELECT COUNT(*) as count FROM ads WHERE status = 'approved'").get().count;
    const expiredAds = db.prepare("SELECT COUNT(*) as count FROM ads WHERE expires_at < ?").get(now).count;
    
    res.json({ totalAds, pendingAds, approvedAds, expiredAds });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/export
router.get('/export', authMiddleware, (req, res) => {
  try {
    const ads = db.prepare('SELECT * FROM ads ORDER BY created_at DESC').all();
    
    res.json({
      ads,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// DELETE /api/admin/ads/clear
router.delete('/ads/clear', authMiddleware, (req, res) => {
  try {
    const ads = db.prepare('SELECT image_path FROM ads').all();
    
    ads.forEach(ad => {
      if (ad.image_path) {
        deleteFile(ad.image_path);
      }
    });
    
    db.prepare('DELETE FROM ads').run();
    
    console.log('All ads cleared');
    
    res.json({ success: true, message: 'All ads deleted successfully' });
  } catch (error) {
    console.error('Error clearing ads:', error);
    res.status(500).json({ error: 'Failed to clear ads' });
  }
});

module.exports = router;

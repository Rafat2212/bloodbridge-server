const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');
const DONORS_FILE = path.join(DATA_DIR, 'donors.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory caches for sub-10ms response time
let requests = [];
let donors = [];

function loadData() {
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
    } else {
      requests = [
        {
          id: "req_101",
          patientName: "তানিয়া আক্তার (Tania Akter)",
          phoneNumber: "01711000000",
          bloodGroup: "A+",
          hospitalLocation: "ঢাকা মেডিকেল কলেজ হাসপাতাল (DMCH), ঢাকা",
          units: 2,
          urgencyNotes: "সিজারিয়ান অপারেশন, জরুরী ভিত্তিতে রক্তের প্রয়োজন।",
          formattedDate: "Today",
          timestamp: Date.now() - 600000
        }
      ];
      saveRequests();
    }
  } catch (e) {
    console.error("Error loading requests:", e);
    requests = [];
  }

  try {
    if (fs.existsSync(DONORS_FILE)) {
      donors = JSON.parse(fs.readFileSync(DONORS_FILE, 'utf8'));
    } else {
      donors = [];
      saveDonors();
    }
  } catch (e) {
    console.error("Error loading donors:", e);
    donors = [];
  }
}

function saveRequests() {
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8');
  } catch (e) {
    console.error("Error saving requests:", e);
  }
}

function saveDonors() {
  try {
    fs.writeFileSync(DONORS_FILE, JSON.stringify(donors, null, 2), 'utf8');
  } catch (e) {
    console.error("Error saving donors:", e);
  }
}

loadData();

// Health check & API status
app.get('/api/health', (req, res) => {
  res.json({
    status: "online",
    name: "BloodBridge Bangladesh Emergency API",
    activeRequests: requests.length,
    registeredDonors: donors.length,
    uptime: process.uptime()
  });
});

// GET /api/requests - Returns all blood requests sorted newest first
app.get('/api/requests', (req, res) => {
  const sorted = [...requests].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  res.json(sorted);
});

// Also support root GET returning JSON if client requests application/json (compatible with Google Apps Script endpoint)
app.get('/', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    const sorted = [...requests].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return res.json(sorted);
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST /api/requests - Post new blood request
app.post(['/api/requests', '/'], (req, res) => {
  const body = req.body || {};
  const type = body.type || 'request';

  if (type === 'delete_request') {
    const targetId = body.id;
    const pName = (body.patientName || '').trim().toLowerCase();
    const phone = (body.phoneNumber || '').replace(/\D/g, '');

    requests = requests.filter(r => {
      if (targetId && r.id === targetId) return false;
      const rPhone = (r.phoneNumber || '').replace(/\D/g, '');
      const rName = (r.patientName || '').trim().toLowerCase();
      if (phone && rPhone === phone && pName && rName === pName) return false;
      return true;
    });
    saveRequests();
    return res.json({ status: "success", message: "Request deleted" });
  }

  if (type === 'donor') {
    const newDonor = {
      id: body.id || `don_${Date.now()}`,
      name: body.name || 'Anonymous Donor',
      phone: body.phone || '',
      bloodGroup: body.bloodGroup || 'A+',
      location: body.location || 'Dhaka',
      formattedDate: body.formattedDate || new Date().toLocaleString(),
      timestamp: body.timestamp || Date.now()
    };
    donors.unshift(newDonor);
    saveDonors();
    return res.json({ status: "success", donor: newDonor });
  }

  // Blood Request
  const newReq = {
    id: body.id || `req_${Date.now()}`,
    patientName: body.patientName || 'Emergency Patient',
    phoneNumber: body.phoneNumber || '',
    bloodGroup: body.bloodGroup || 'A+',
    hospitalLocation: body.hospitalLocation || 'Hospital',
    units: parseInt(body.units) || 1,
    urgencyNotes: body.urgencyNotes || '',
    formattedDate: body.formattedDate || new Date().toLocaleString(),
    timestamp: body.timestamp || Date.now()
  };

  // Remove duplicate ID if exists, then add to front
  requests = requests.filter(r => r.id !== newReq.id);
  requests.unshift(newReq);
  saveRequests();

  console.log(`🚨 Emergency Blood Request Added: ${newReq.bloodGroup} for ${newReq.patientName} at ${newReq.hospitalLocation}`);
  res.json({ status: "success", request: newReq });
});

// DELETE /api/requests/:id
app.delete('/api/requests/:id', (req, res) => {
  const reqId = req.params.id;
  requests = requests.filter(r => r.id !== reqId);
  saveRequests();
  res.json({ status: "success", message: `Request ${reqId} deleted` });
});

// GET /api/donors
app.get('/api/donors', (req, res) => {
  res.json(donors);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ BloodBridge Emergency Server running on http://localhost:${PORT}`);

  // 24/7 Keep-Alive: Ping itself every 4 minutes so Render NEVER goes into sleep/spin-down mode
  const https = require('https');
  const http = require('http');
  const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || 'https://bloodbridge-server-2trk.onrender.com';
  
  setInterval(() => {
    try {
      const client = keepAliveUrl.startsWith('https') ? https : http;
      client.get(`${keepAliveUrl}/api/health`, (res) => {
        console.log(`[24/7 Keep-Alive] Pinged ${keepAliveUrl} - Status: ${res.statusCode}`);
      }).on('error', (err) => {
        console.warn('[24/7 Keep-Alive] Error:', err.message);
      });
    } catch (e) {}
  }, 4 * 60 * 1000);
});

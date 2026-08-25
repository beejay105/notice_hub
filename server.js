const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;
const accessCode = process.env.NOTICE_ACCESS_CODE || 'NOTICE2026';
const uploadDirectory = path.join(__dirname, 'uploads');
const sessions = new Map();

fs.mkdirSync(uploadDirectory, { recursive: true });
const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_request, file, callback) => {
    const safeName = file.originalname.replace(/[^a-z0-9.-]/gi, '-');
    callback(null, `${Date.now()}-${safeName}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.get('/about.html', (_request, response) => {
  const aboutPage = fs.readFileSync(path.join(__dirname, 'about.html'), 'utf8')
    .replaceAll('About the organization · Notice Hub', 'About CarePoint Pharmacy')
    .replaceAll('notice<span>hub</span>', 'care<span>point</span>')
    .replaceAll('your team, together', 'pharmacy & online store')
    .replaceAll('People doing<br><span>good work together.</span>', 'Care for people.<br><span>Move health forward.</span>')
    .replaceAll('Notice Hub is a private communication space for our organization. It keeps everyday messages, shared resources, and important updates easy for everyone to find.', 'CarePoint Pharmacy provides trusted medicines, wellness products, and everyday health support through our local pharmacy and online store.')
    .replaceAll('We make it easier for our team to stay connected, share knowledge, and keep our community moving forward.', 'We make trusted pharmacy care easier to access, whether customers visit us in person or shop online.')
    .replaceAll('Every member brings a valuable perspective. This space helps good ideas travel to the people who need them.', 'Our pharmacists and care team combine professional knowledge with a human approach to help customers make confident health choices.')
    .replaceAll('Messages and resources are kept inside our organization so the team can communicate with confidence.', 'We protect customer privacy and keep our team aligned across prescriptions, orders, stock, and delivery support.');
  response.send(aboutPage);
});
app.use(express.static(__dirname, { index: false }));
app.use('/uploads', express.static(uploadDirectory));
app.get('/about.html', (_request, response) => {
  const aboutPage = fs.readFileSync(path.join(__dirname, 'about.html'), 'utf8')
    .replaceAll('About the organization · Notice Hub', 'About CarePoint Pharmacy')
    .replaceAll('notice<span>hub</span>', 'care<span>point</span>')
    .replaceAll('your team, together', 'pharmacy & online store')
    .replaceAll('People doing<br><span>good work together.</span>', 'Care for people.<br><span>Move health forward.</span>')
    .replaceAll('Notice Hub is a private communication space for our organization. It keeps everyday messages, shared resources, and important updates easy for everyone to find.', 'CarePoint Pharmacy provides trusted medicines, wellness products, and everyday health support through our local pharmacy and online store.')
    .replaceAll('We make it easier for our team to stay connected, share knowledge, and keep our community moving forward.', 'We make trusted pharmacy care easier to access, whether customers visit us in person or shop online.')
    .replaceAll('Every member brings a valuable perspective. This space helps good ideas travel to the people who need them.', 'Our pharmacists and care team combine professional knowledge with a human approach to help customers make confident health choices.')
    .replaceAll('Messages and resources are kept inside our organization so the team can communicate with confidence.', 'We protect customer privacy and keep our team aligned across prescriptions, orders, stock, and delivery support.');
  response.send(aboutPage);
});

const messages = [
  { initials: 'MR', name: 'Maya Rodriguez', time: '8:42 AM', text: 'The summer program photos are ready for everyone to review.', avatar: 'avatar-maya', unread: true, type: 'all' },
  { initials: 'JT', name: 'Jordan Taylor', time: 'Yesterday', text: "Thanks to everyone who helped make Saturday's community day such a success!", avatar: 'avatar-jordan', unread: true, type: 'mentions' },
  { initials: 'PS', name: 'Priya Shah', time: 'Yesterday', text: '@Alex I added the updated budget notes to the board folder.', avatar: 'avatar-priya', unread: true, type: 'mentions' },
  { initials: 'NW', name: 'Nico Williams', time: 'Mon', text: 'Quick reminder: our all-hands check-in is this Thursday at 10am.', avatar: 'avatar-nico', unread: false, type: 'all' }
];
const notices = [
  { tag: 'Important', date: 'Aug 25, 2026', title: 'Welcome to the new Notice Hub', body: "We've brought messages, documents, and team updates into one friendly place." },
  { tag: 'Coming up', date: 'Aug 28, 2026', title: 'Quarterly all-hands', body: "Join us Friday at 10am for a quick look at what we've accomplished and what's next." },
  { tag: 'Resource', date: 'Aug 22, 2026', title: 'New volunteer guide', body: 'The latest welcome guide is ready in the Files area.' }
];
const files = [];

function requireSession(request, response, next) {
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions.has(token)) return response.status(401).json({ error: 'Please sign in first.' });
  request.user = sessions.get(token);
  next();
}

app.post('/api/login', (request, response) => {
  const { name, accessCode: submittedCode } = request.body;
  if (!name?.trim() || submittedCode !== accessCode) return response.status(401).json({ error: 'Check your name and access code.' });
  const token = crypto.randomUUID();
  const user = { name: name.trim(), initials: name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() };
  sessions.set(token, user);
  response.json({ token, user });
});

app.post('/api/logout', requireSession, (request, response) => {
  const token = request.headers.authorization.replace('Bearer ', '');
  sessions.delete(token);
  response.json({ success: true });
});

app.get('/api/messages', requireSession, (_request, response) => response.json(messages));
app.post('/api/messages', requireSession, (request, response) => {
  const text = request.body.text?.trim();
  if (!text) return response.status(400).json({ error: 'Message text is required.' });
  const now = new Date();
  const message = { initials: request.user.initials, name: request.user.name, time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), text, avatar: 'avatar-you', unread: false, type: 'all' };
  messages.unshift(message);
  response.status(201).json(message);
});

app.get('/api/files', requireSession, (_request, response) => response.json(files));
app.post('/api/upload', requireSession, upload.array('files', 10), (request, response) => {
  const uploaded = request.files.map((file) => ({ name: file.originalname, meta: `${request.user.name} · ${Math.ceil(file.size / 1024)} KB`, type: path.extname(file.originalname).slice(1, 5).toUpperCase(), className: /^image\//.test(file.mimetype) ? 'img' : file.mimetype === 'application/pdf' ? 'pdf' : 'doc', url: `/uploads/${file.filename}` }));
  files.unshift(...uploaded);
  response.status(201).json(uploaded);
});
app.get('/api/notices', requireSession, (_request, response) => response.json(notices));
app.post('/api/notices', requireSession, (request, response) => {
  const { title, body, tag = 'Update' } = request.body;
  if (!title?.trim() || !body?.trim()) return response.status(400).json({ error: 'A notice title and message are required.' });
  const notice = { tag: tag.trim() || 'Update', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), title: title.trim(), body: body.trim(), author: request.user.name };
  notices.unshift(notice);
  response.status(201).json(notice);
});

app.get('*', (request, response) => response.sendFile(path.join(__dirname, request.path === '/' ? 'login.html' : 'index.html')));
app.listen(port, () => console.log(`Notice Hub running at http://localhost:${port}`));

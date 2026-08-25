const messages = [
  { initials: 'MR', name: 'Maya Rodriguez', time: '8:42 AM', text: 'The summer program photos are ready for everyone to review.', avatar: 'avatar-maya', unread: true, type: 'all' },
  { initials: 'JT', name: 'Jordan Taylor', time: 'Yesterday', text: 'Thanks to everyone who helped make Saturday\'s community day such a success!', avatar: 'avatar-jordan', unread: true, type: 'mentions' },
  { initials: 'PS', name: 'Priya Shah', time: 'Yesterday', text: '<span class="mention">@Alex</span> I added the updated budget notes to the board folder.', avatar: 'avatar-priya', unread: true, type: 'mentions' },
  { initials: 'NW', name: 'Nico Williams', time: 'Mon', text: 'Quick reminder: our all-hands check-in is this Thursday at 10am.', avatar: 'avatar-nico', unread: false, type: 'all' },
  { initials: 'MR', name: 'Maya Rodriguez', time: 'Mon', text: 'Sharing a first look at the new volunteer welcome pack.', avatar: 'avatar-maya', unread: false, type: 'all' }
];

const files = [
  { name: 'Summer program photos.zip', meta: 'Maya Rodriguez · 2.4 MB', type: 'IMG', className: 'img' },
  { name: 'Board meeting notes.pdf', meta: 'Priya Shah · 860 KB', type: 'PDF', className: 'pdf' },
  { name: 'Volunteer welcome pack.docx', meta: 'Nico Williams · 1.2 MB', type: 'DOC', className: 'doc' }
];

const messageList = document.querySelector('#message-list');
const fileList = document.querySelector('#file-list');
const toast = document.querySelector('#toast');
const modal = document.querySelector('#compose-modal');
const fileInput = document.querySelector('#file-input');
let activeFilter = 'all';
let sessionToken = '';

async function apiRequest(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
  if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

function showWorkspace() {
  document.querySelector('#login-screen').hidden = true;
  document.querySelector('#signed-out-screen').hidden = true;
  document.querySelector('#notice-board').hidden = true;
  document.querySelector('#app-shell').hidden = false;
}

function showNoticeBoard() {
  document.querySelector('#app-shell').hidden = true;
  document.querySelector('#notice-board').hidden = false;
  window.lucide?.createIcons();
}

function renderMessages() {
  const query = document.querySelector('#search-input').value.toLowerCase();
  const filtered = messages.filter((message) => {
    const fitsFilter = activeFilter === 'all' || (activeFilter === 'unread' && message.unread) || (activeFilter === 'mentions' && message.type === 'mentions');
    return fitsFilter && `${message.name} ${message.text}`.toLowerCase().includes(query);
  });
  messageList.innerHTML = filtered.length ? filtered.map((message) => `
    <article class="message-row ${message.unread ? 'unread' : ''}">
      <div class="avatar message-avatar ${message.avatar}">${message.initials}</div>
      <div class="message-body"><div class="message-meta"><strong>${message.name}</strong><time>${message.time}</time></div><p>${message.text}</p></div>
      ${message.unread ? '<span class="unread-dot" aria-label="Unread"></span>' : ''}
    </article>`).join('') : '<div class="empty-state">No messages match your search.</div>';
}

async function refreshMessages() {
  if (!sessionToken) return;
  try {
    const latestMessages = await apiRequest('/api/messages');
    messages.splice(0, messages.length, ...latestMessages);
    renderMessages();
  } catch (error) { }
}

function renderFiles() {
  fileList.innerHTML = files.map((file) => `
    <div class="file-row"><span class="file-type ${file.className}">${file.type}</span><div class="file-info"><strong>${file.name}</strong><small>${file.meta}</small></div><i data-lucide="download"></i></div>`).join('');
  window.lucide?.createIcons();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

function openCompose() { modal.hidden = false; document.querySelector('#message-text').focus(); }
function closeCompose() { modal.hidden = true; }

async function handleFiles(selectedFiles) {
  if (!selectedFiles.length) return;
  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append('files', file));
  try {
    const uploaded = await apiRequest('/api/upload', { method: 'POST', body: formData });
    files.unshift(...uploaded);
    renderFiles();
    document.querySelector('#attachment-name').textContent = `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`;
    showToast(`${selectedFiles[0].name} uploaded successfully`);
  } catch (error) { showToast(error.message); }
}

document.querySelector('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  try {
    const data = await apiRequest('/api/login', { method: 'POST', body: JSON.stringify({ name: document.querySelector('#login-name').value, accessCode: document.querySelector('#access-code').value }) });
    sessionToken = data.token;
    document.querySelector('#profile-name').textContent = data.user.name;
    document.querySelectorAll('.avatar-you').forEach((avatar) => { avatar.textContent = data.user.initials; });
    document.querySelector('#page-heading').innerHTML = `Good morning, ${data.user.name.split(' ')[0]}<span>.</span>`;
    showWorkspace();
    refreshMessages();
    showToast(`Welcome, ${data.user.name.split(' ')[0]}`);
  } catch (error) { showToast(error.message); }
  button.disabled = false;
});

document.querySelector('#notifications-button').addEventListener('click', showNoticeBoard);
document.querySelector('#close-notice-board').addEventListener('click', showWorkspace);
document.querySelector('#sign-out-button').addEventListener('click', async () => {
  try { await apiRequest('/api/logout', { method: 'POST' }); } catch (error) { showToast(error.message); return; }
  sessionToken = '';
  document.querySelector('#app-shell').hidden = true;
  document.querySelector('#signed-out-screen').hidden = false;
  window.lucide?.createIcons();
});
document.querySelector('#return-login').addEventListener('click', () => {
  document.querySelector('#signed-out-screen').hidden = true;
  document.querySelector('#login-screen').hidden = false;
  document.querySelector('#login-name').focus();
});

document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', () => {
  document.querySelectorAll('.nav-item').forEach((nav) => nav.classList.remove('active'));
  item.classList.add('active');
  const view = item.dataset.view;
  const label = item.querySelector('span').textContent;
  document.querySelector('#view-title').textContent = label;
  document.querySelector('#list-heading').textContent = view === 'files' ? 'Shared files' : view === 'drafts' ? 'Your drafts' : view === 'sent' ? 'Sent messages' : 'Recent messages';
  showToast(`${label} view selected`);
}));
document.querySelectorAll('.filter-button').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.filter-button').forEach((filter) => filter.classList.remove('active'));
  button.classList.add('active'); activeFilter = button.dataset.filter; renderMessages();
}));
document.querySelector('#search-input').addEventListener('input', renderMessages);
document.querySelector('#open-compose').addEventListener('click', openCompose);
document.querySelector('#close-compose').addEventListener('click', closeCompose);
document.querySelector('#cancel-compose').addEventListener('click', closeCompose);
modal.addEventListener('click', (event) => { if (event.target === modal) closeCompose(); });
document.querySelector('#upload-top').addEventListener('click', () => fileInput.click());
document.querySelector('#drop-zone').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (event) => handleFiles([...event.target.files]));
document.querySelector('#attach-button').addEventListener('click', () => fileInput.click());
document.querySelector('#chat-attach').addEventListener('click', () => fileInput.click());
document.querySelector('#chat-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); document.querySelector('#chat-form').requestSubmit(); }
});
document.querySelector('#chat-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.querySelector('#chat-input');
  const text = input.value.trim();
  if (!text) return;
  try {
    const message = await apiRequest('/api/messages', { method: 'POST', body: JSON.stringify({ text }) });
    messages.unshift(message); renderMessages(); input.value = ''; input.focus();
  } catch (error) { showToast(error.message); }
});
document.querySelector('#send-message').addEventListener('click', () => {
  const text = document.querySelector('#message-text').value.trim();
  if (!text) { showToast('Write a message before sending'); return; }
  apiRequest('/api/messages', { method: 'POST', body: JSON.stringify({ text }) }).then((message) => {
    messages.unshift(message); renderMessages(); closeCompose(); document.querySelector('#message-text').value = ''; document.querySelector('#attachment-name').textContent = 'No files attached'; showToast('Message sent to your team');
  }).catch((error) => showToast(error.message));
});
document.querySelector('#view-files').addEventListener('click', () => showToast('Opening your full file library'));
document.querySelector('#drop-zone').addEventListener('dragover', (event) => { event.preventDefault(); event.currentTarget.classList.add('dragging'); });
document.querySelector('#drop-zone').addEventListener('dragleave', (event) => event.currentTarget.classList.remove('dragging'));
document.querySelector('#drop-zone').addEventListener('drop', (event) => { event.preventDefault(); event.currentTarget.classList.remove('dragging'); handleFiles([...event.dataTransfer.files]); });
document.addEventListener('keydown', (event) => { if (event.key.toLowerCase() === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) openCompose(); if (event.key === 'Escape') closeCompose(); if (event.key === '/' && document.activeElement.tagName !== 'INPUT') { event.preventDefault(); document.querySelector('#search-input').focus(); } });

renderMessages();
renderFiles();
window.lucide?.createIcons();
setInterval(refreshMessages, 5000);

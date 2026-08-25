const token = sessionStorage.getItem('noticeHubToken');
const savedUser = JSON.parse(sessionStorage.getItem('noticeHubUser') || '{"name":"Alex Lee","initials":"AL"}');
if (!token) window.location.href = 'login.html';
const authHeaders = () => ({ Authorization: `Bearer ${sessionStorage.getItem('noticeHubToken')}` });
const messages = [];
const files = [];
const messageList = document.querySelector('#message-list');
const fileList = document.querySelector('#file-list');
const toast = document.querySelector('#toast');
const fileInput = document.querySelector('#file-input');
document.title = 'Team chat · CarePoint Pharmacy';
document.querySelectorAll('.brand-mark').forEach((mark) => { mark.innerHTML = '<i data-lucide="cross"></i>'; });
document.querySelectorAll('.brand-lockup strong').forEach((brand) => { brand.innerHTML = 'care<span>point</span>'; });
document.querySelectorAll('.brand-lockup small').forEach((label) => { label.textContent = 'pharmacy & online store'; });
document.querySelector('.page-intro .eyebrow').innerHTML = 'Pharmacy team room · <span id="member-count">38 members</span>';
document.querySelector('.page-intro h1').innerHTML = 'CarePoint team chat<span>.</span>';
document.querySelector('.intro-copy').textContent = 'Coordinate prescriptions, stock, deliveries, and customer care.';
const storeLink = document.createElement('a');
storeLink.className = 'nav-item store-link';
storeLink.href = 'store.html';
storeLink.innerHTML = '<i data-lucide="shopping-bag"></i><span>Online store</span>';
document.querySelector('.primary-nav').append(storeLink);
const topSignOut = document.createElement('button');
topSignOut.className = 'top-signout';
topSignOut.type = 'button';
topSignOut.innerHTML = '<i data-lucide="log-out"></i><span>Sign out</span>';
topSignOut.title = 'Sign out';
document.querySelector('.topbar-actions').append(topSignOut);
document.querySelector('.right-rail')?.remove();
document.querySelector('a[href="#files"]')?.setAttribute('href', 'files.html');
const homeLogo = document.querySelector('.brand-lockup');
homeLogo?.setAttribute('role', 'link');
homeLogo?.setAttribute('tabindex', '0');
homeLogo?.addEventListener('click', () => { window.location.href = 'about.html'; });
homeLogo?.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.location.href = 'about.html'; } });
function showToast(message) { toast.textContent = message; toast.classList.add('visible'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('visible'), 2800); }
function renderMessages() { const query = document.querySelector('#search-input').value.toLowerCase(); const visible = messages.filter((item) => `${item.name} ${item.text}`.toLowerCase().includes(query)); messageList.innerHTML = visible.map((item, index) => `<article class="message-row ${index % 2 ? 'chat-reply' : ''}"><div class="avatar message-avatar ${item.avatar}">${item.initials}</div><div class="message-body"><div class="message-meta"><strong>${item.name}</strong><time>${item.time}</time></div><p>${item.text.replace(/</g, '&lt;')}</p></div></article>`).join('') || '<div class="empty-state">No messages match your search.</div>'; messageList.scrollTop = messageList.scrollHeight; }
function renderFiles() { fileList.innerHTML = files.map((file) => `<div class="file-row"><span class="file-type ${file.className}">${file.type}</span><div class="file-info"><strong>${file.name}</strong><small>${file.meta}</small></div><i data-lucide="download"></i></div>`).join('') || '<div class="empty-state">No files shared yet.</div>'; window.lucide?.createIcons(); }
async function loadMessages() { const response = await fetch('/api/messages', { headers: authHeaders() }); if (response.status === 401) return window.location.href = 'login.html'; messages.splice(0, messages.length, ...(await response.json())); renderMessages(); }
async function loadFiles() { const response = await fetch('/api/files', { headers: authHeaders() }); files.splice(0, files.length, ...(await response.json())); renderFiles(); }
async function uploadFiles(selectedFiles) { if (!selectedFiles.length) return; const formData = new FormData(); selectedFiles.forEach((file) => formData.append('files', file)); const response = await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: formData }); const uploaded = await response.json(); if (!response.ok) return showToast(uploaded.error); files.unshift(...uploaded); renderFiles(); showToast(`${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} uploaded`); }
async function sendMessage(text) { const response = await fetch('/api/messages', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }); const message = await response.json(); if (!response.ok) return showToast(message.error); messages.push(message); renderMessages(); }
const userInitials = savedUser.initials || 'AL'; document.querySelector('#profile-name').textContent = savedUser.name; document.querySelector('#side-avatar').textContent = userInitials; document.querySelector('#top-avatar').textContent = userInitials;
document.querySelector('#chat-form').addEventListener('submit', async (event) => { event.preventDefault(); const input = document.querySelector('#chat-input'); const text = input.value.trim(); if (!text) return; await sendMessage(text); input.value = ''; input.focus(); });
document.querySelector('#chat-input').addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); document.querySelector('#chat-form').requestSubmit(); } });
document.querySelector('#search-input').addEventListener('input', renderMessages);
document.querySelector('#upload-top').addEventListener('click', () => fileInput.click()); document.querySelector('#chat-attach').addEventListener('click', () => fileInput.click()); document.querySelector('#drop-zone').addEventListener('click', () => fileInput.click()); fileInput.addEventListener('change', (event) => uploadFiles([...event.target.files]));
document.querySelector('#drop-zone').addEventListener('dragover', (event) => { event.preventDefault(); event.currentTarget.classList.add('dragging'); }); document.querySelector('#drop-zone').addEventListener('dragleave', (event) => event.currentTarget.classList.remove('dragging')); document.querySelector('#drop-zone').addEventListener('drop', (event) => { event.preventDefault(); event.currentTarget.classList.remove('dragging'); uploadFiles([...event.dataTransfer.files]); });
function signOut() { const headers = authHeaders(); sessionStorage.clear(); window.location.assign('signed-out.html'); fetch('/api/logout', { method: 'POST', headers }).catch(() => {}); }
document.querySelector('#sign-out-button').addEventListener('click', signOut);
topSignOut.addEventListener('click', signOut);
document.querySelector('#sign-out-button').innerHTML = '<i data-lucide="log-out"></i><span>Sign out</span>';
document.querySelector('#sign-out-button').title = 'Sign out';
document.querySelector('#open-compose').addEventListener('click', () => { document.querySelector('#compose-modal').hidden = false; document.querySelector('#message-text').focus(); }); document.querySelector('#close-compose').addEventListener('click', () => document.querySelector('#compose-modal').hidden = true); document.querySelector('#cancel-compose').addEventListener('click', () => document.querySelector('#compose-modal').hidden = true); document.querySelector('#send-message').addEventListener('click', async () => { const input = document.querySelector('#message-text'); const text = input.value.trim(); if (!text) return showToast('Write a message before sending'); await sendMessage(text); input.value = ''; document.querySelector('#compose-modal').hidden = true; });
function refreshIcons() {
	if (window.lucide?.createIcons) window.lucide.createIcons();
	if (!document.querySelector('.top-action svg')) document.querySelector('.top-action')?.classList.add('icon-fallback-bell');
	if (!document.querySelector('.chat-send svg')) document.querySelector('.chat-send')?.classList.add('icon-fallback-send');
}
loadMessages(); loadFiles(); setInterval(loadMessages, 5000); refreshIcons(); window.addEventListener('load', refreshIcons); setTimeout(refreshIcons, 500);

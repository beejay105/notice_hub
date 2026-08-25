const token = sessionStorage.getItem('noticeHubToken');
if (!token) window.location.href = 'login.html';
document.title = 'Notice board · CarePoint Pharmacy';
const noticeGrid = document.querySelector('.notice-grid');
const noticeForm = document.createElement('form');
noticeForm.className = 'notice-composer';
noticeForm.innerHTML = '<div><p class="eyebrow">Share with everyone</p><h2>Add a new notice</h2><p>Post an update that the whole organization can see.</p></div><div class="notice-form-fields"><input id="notice-title" type="text" placeholder="Notice title" required><select id="notice-tag"><option>Update</option><option>Important</option><option>Coming up</option><option>Resource</option></select><textarea id="notice-body" rows="3" placeholder="Write your notice..." required></textarea><button class="send-button" type="submit"><i data-lucide="megaphone"></i>Publish notice</button></div>';
document.querySelector('.notice-board-heading').after(noticeForm);
noticeForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	const response = await fetch('/api/notices', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: document.querySelector('#notice-title').value, body: document.querySelector('#notice-body').value, tag: document.querySelector('#notice-tag').value }) });
	const notice = await response.json();
	if (!response.ok) return window.alert(notice.error);
	const card = document.createElement('article'); card.className = 'notice-card'; card.innerHTML = `<div class="notice-card-top"><span class="notice-tag teal-tag">${notice.tag}</span><time>${notice.date}</time></div><h2>${notice.title}</h2><p>${notice.body}</p><div class="notice-author"><span>Shared by ${notice.author}</span></div>`; noticeGrid.prepend(card); noticeForm.reset();
});
window.lucide?.createIcons();

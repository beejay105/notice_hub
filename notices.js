const token = sessionStorage.getItem('noticeHubToken');
if (!token) window.location.href = 'login.html';
document.title = 'Notice board · CarePoint Pharmacy';
const noticeGrid = document.querySelector('.notice-grid');
const noticeDetail = document.createElement('div');
noticeDetail.className = 'notice-detail-backdrop';
noticeDetail.hidden = true;
noticeDetail.innerHTML = '<article class="notice-detail" role="dialog" aria-modal="true" aria-labelledby="notice-detail-title"><button class="icon-button notice-detail-close" aria-label="Close notice" type="button"><i data-lucide="x"></i></button><p class="eyebrow" id="notice-detail-tag"></p><h2 id="notice-detail-title"></h2><p id="notice-detail-body"></p><div class="notice-detail-footer"><span id="notice-detail-date"></span><button class="send-button notice-detail-close" type="button">Close</button></div></article>';
document.body.append(noticeDetail);
document.querySelectorAll('.notice-card').forEach((card) => {
	const action = document.createElement('button');
	action.className = 'notice-action read-more'; action.type = 'button'; action.textContent = 'Read more'; card.append(action);
});
function openNotice(card) {
	document.querySelector('#notice-detail-tag').textContent = card.querySelector('.notice-tag')?.textContent || 'Notice';
	document.querySelector('#notice-detail-title').textContent = card.querySelector('h2')?.textContent || '';
	document.querySelector('#notice-detail-body').textContent = card.querySelector('p:not(.eyebrow)')?.textContent || '';
	document.querySelector('#notice-detail-date').textContent = card.querySelector('time')?.textContent || 'Shared today';
	noticeDetail.hidden = false; window.lucide?.createIcons();
}
noticeGrid.addEventListener('click', (event) => { if (event.target.closest('.read-more')) openNotice(event.target.closest('.notice-card')); });
noticeDetail.addEventListener('click', (event) => { if (event.target === noticeDetail || event.target.closest('.notice-detail-close')) noticeDetail.hidden = true; });
const noticeForm = document.createElement('form');
noticeForm.className = 'notice-composer';
noticeForm.innerHTML = '<div><p class="eyebrow">Share with everyone</p><h2>Add a new notice</h2><p>Post an update that the whole organization can see.</p></div><div class="notice-form-fields"><input id="notice-title" type="text" placeholder="Notice title" required><select id="notice-tag"><option>Update</option><option>Important</option><option>Coming up</option><option>Resource</option></select><textarea id="notice-body" rows="3" placeholder="Write your notice..." required></textarea><button class="send-button" type="submit"><i data-lucide="megaphone"></i>Publish notice</button></div>';
document.querySelector('.notice-board-heading').after(noticeForm);
noticeForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	const response = await fetch('/api/notices', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: document.querySelector('#notice-title').value, body: document.querySelector('#notice-body').value, tag: document.querySelector('#notice-tag').value }) });
	const notice = await response.json();
	if (!response.ok) return window.alert(notice.error);
	const card = document.createElement('article'); card.className = 'notice-card'; card.innerHTML = `<div class="notice-card-top"><span class="notice-tag teal-tag">${notice.tag}</span><time>${notice.date}</time></div><h2>${notice.title}</h2><p>${notice.body}</p><div class="notice-author"><span>Shared by ${notice.author}</span></div><button class="notice-action read-more" type="button">Read more</button>`; noticeGrid.prepend(card); noticeForm.reset();
});
window.lucide?.createIcons();

const toast = document.querySelector('#toast');
document.title = 'Sign in · CarePoint Pharmacy';
document.querySelectorAll('.brand-mark').forEach((mark) => { mark.innerHTML = '<i data-lucide="cross"></i>'; });
document.querySelector('.login-brand strong').innerHTML = 'care<span>point</span>';
document.querySelector('.login-brand small').textContent = 'pharmacy & online store';
document.querySelector('.login-card .eyebrow').textContent = 'Team sign in';
document.querySelector('.login-card h1').innerHTML = 'Care for people.<br><span>Move health forward.</span>';
document.querySelector('.login-copy').textContent = "Sign in to your private CarePoint Pharmacy team workspace.";
function showToast(message) { toast.textContent = message; toast.classList.add('visible'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('visible'), 2800); }
document.querySelector('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button'); button.disabled = true;
  try {
    const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: document.querySelector('#login-name').value, accessCode: document.querySelector('#access-code').value }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error);
    sessionStorage.setItem('noticeHubToken', data.token); sessionStorage.setItem('noticeHubUser', JSON.stringify(data.user)); window.location.href = 'chat.html';
  } catch (error) { showToast(error.message); button.disabled = false; }
});
window.lucide?.createIcons();

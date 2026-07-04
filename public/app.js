const state = {
  user: null,
  page: 'landing',
  feedPage: 1,
  hasMore: true,
  loading: false,
  posts: [],
  theme: localStorage.getItem('theme') || 'light'
};

document.documentElement.dataset.theme = state.theme;

const $ = (selector, root = document) => root.querySelector(selector);
const app = $('#app');
const toastEl = $('#toast');

const icons = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>'
};

async function api(path, options = {}) {
  const opts = { credentials: 'include', ...options };
  if (opts.body && !(opts.body instanceof FormData)) {
    opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.errors?.[0]?.msg || data.message || 'Request failed');
  return data;
}

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastEl.timer);
  toastEl.timer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  const units = [['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60]];
  for (const [label, value] of units) if (seconds >= value) return `${Math.floor(seconds / value)}${label}`;
  return 'now';
}

function avatar(user) {
  return user?.avatar || user?.avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.username || 'N')}`;
}

function landing() {
  app.innerHTML = `
    <section class="landing">
      <div class="hero">
        <div class="brand"><span class="logo">N</span><span>Nexus Social</span></div>
        <h1>Connect. Post. Discover.</h1>
        <p>A clean social space for sharing updates, photos, and conversations.</p>
        <div class="hero-strip">
          <span class="pill">Feed</span><span class="pill">Profiles</span><span class="pill">Messages</span>
        </div>
      </div>
      <div class="auth-card">
        <div class="tabs">
          <button class="tab active" data-auth-tab="login">Login</button>
          <button class="tab" data-auth-tab="register">Register</button>
        </div>
        <form id="authForm"></form>
      </div>
    </section>`;
  renderAuthForm('login');
}

function renderAuthForm(mode) {
  document.querySelectorAll('[data-auth-tab]').forEach((btn) => btn.classList.toggle('active', btn.dataset.authTab === mode));
  $('#authForm').innerHTML = `
    ${mode === 'register' ? '<div class="field"><label>Username</label><input class="input" name="username" minlength="3" maxlength="28" required placeholder="maya.codes"></div>' : ''}
    <div class="field"><label>Email</label><input class="input" name="email" type="email" required placeholder="you@nexus.dev"></div>
    <div class="field"><label>Password</label><input class="input" name="password" type="password" minlength="8" required placeholder="At least 8 characters"></div>
    <button class="btn" style="width:100%" type="submit">${mode === 'login' ? 'Sign in' : 'Create account'}</button>
    <p class="muted tiny">${mode === 'login' ? 'Welcome back to Nexus.' : 'Create your profile in a few seconds.'}</p>`;
  $('#authForm').onsubmit = (event) => submitAuth(event, mode);
}

async function submitAuth(event, mode) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const res = await api(`/api/auth/${mode}`, { method: 'POST', body: data });
    state.user = res.user;
    state.page = 'home';
    await loadHome();
  } catch (err) {
    toast(err.message);
  }
}

function shell(active = state.page) {
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><span class="logo">N</span><span>Nexus</span></div>
        <nav class="nav">
          ${navButton('home', 'Home', active)}
          ${navButton('search', 'Search', active)}
          ${navButton('bell', 'Notifications', active)}
          ${navButton('user', 'Profile', active)}
          ${navButton('gear', 'Settings', active)}
          <button data-action="logout">${icons.send}<span>Logout</span></button>
        </nav>
      </aside>
      <section class="content">
        <div class="feed-col" id="mainCol"></div>
        <aside class="right-col" id="sideCol"></aside>
      </section>
    </div>`;
}

function navButton(page, label, active) {
  return `<button class="${active === page ? 'active' : ''}" data-page="${page}">${icons[page]}<span>${label}</span></button>`;
}

function bindGlobal() {
  document.addEventListener('click', async (event) => {
    const pageBtn = event.target.closest('[data-page]');
    if (pageBtn) return navigate(pageBtn.dataset.page);
    if (event.target.closest('[data-action="logout"]')) return logout();
    const tab = event.target.closest('[data-auth-tab]');
    if (tab) renderAuthForm(tab.dataset.authTab);
  });
}

async function navigate(page, payload) {
  state.page = page;
  if (page === 'home') return loadHome();
  if (page === 'search') return loadSearch();
  if (page === 'bell') return loadNotifications();
  if (page === 'user') return loadProfile(payload || state.user.username);
  if (page === 'settings') return loadSettings();
}

async function loadHome(reset = true) {
  if (reset) {
    state.feedPage = 1;
    state.hasMore = true;
    state.posts = [];
    shell('home');
    $('#mainCol').innerHTML = `${topbar('Home Feed')} ${composer()} <div id="posts">${skeletons(3)}</div>`;
    bindComposer();
    loadSide();
  }
  await fetchPosts();
}

async function fetchPosts() {
  if (state.loading || !state.hasMore) return;
  state.loading = true;
  try {
    const data = await api(`/api/posts?page=${state.feedPage}`);
    state.posts = [...state.posts, ...data.posts];
    state.hasMore = data.hasMore;
    state.feedPage += 1;
    renderPosts();
  } catch (err) {
    toast(err.message);
  } finally {
    state.loading = false;
  }
}

function topbar(title, action = '') {
  return `<div class="topbar"><h2>${title}</h2><div>${action}<button class="btn icon secondary" data-theme-toggle title="Toggle theme">${icons.moon}</button></div></div>`;
}

function composer() {
  return `
    <form class="composer" id="composer">
      <div class="composer-row">
        <img class="avatar" src="${avatar(state.user)}" alt="">
        <textarea name="content" maxlength="500" placeholder="What are you building, learning, or shipping today?" required></textarea>
      </div>
      <img class="preview" id="postPreview" hidden alt="">
      <div class="composer-actions">
        <label class="btn secondary small">${icons.image} Image<input name="image" type="file" accept="image/*" hidden></label>
        <span class="counter tiny" id="charCounter">0 / 500</span>
        <button class="btn small" type="submit">${icons.send} Post</button>
      </div>
    </form>`;
}

function bindComposer() {
  const form = $('#composer');
  const text = form.content;
  const counter = $('#charCounter');
  text.oninput = () => {
    counter.textContent = `${text.value.length} / 500`;
    counter.classList.toggle('warn', text.value.length > 430);
  };
  form.image.onchange = () => previewFile(form.image.files[0], $('#postPreview'));
  form.onsubmit = async (event) => {
    event.preventDefault();
    const fd = new FormData(form);
    try {
      const data = await api('/api/posts', { method: 'POST', body: fd });
      state.posts.unshift(data.post);
      form.reset();
      $('#postPreview').hidden = true;
      counter.textContent = '0 / 500';
      renderPosts();
      toast('Post published.');
    } catch (err) {
      toast(err.message);
    }
  };
}

function previewFile(file, img) {
  if (!file) return;
  img.src = URL.createObjectURL(file);
  img.hidden = false;
}

function renderPosts(list = state.posts) {
  const root = $('#posts');
  if (!root) return;
  root.innerHTML = list.length ? list.map(postCard).join('') : `<div class="empty">No posts yet. Start the conversation with something real.</div>`;
  root.querySelectorAll('[data-like]').forEach((btn) => btn.onclick = () => likePost(btn.dataset.like));
  root.querySelectorAll('[data-comments]').forEach((btn) => btn.onclick = () => toggleComments(btn.dataset.comments));
  root.querySelectorAll('[data-delete-post]').forEach((btn) => btn.onclick = () => deletePost(btn.dataset.deletePost));
  root.querySelectorAll('[data-edit-post]').forEach((btn) => btn.onclick = () => editPost(btn.dataset.editPost));
  if (state.hasMore) root.insertAdjacentHTML('beforeend', `<button class="btn secondary" id="loadMore">Load more</button>`);
  const loadMore = $('#loadMore');
  if (loadMore) loadMore.onclick = () => fetchPosts();
}

function postCard(post) {
  const own = String(post.author._id) === String(state.user._id);
  return `
    <article class="post" id="post-${post._id}">
      <div class="post-body">
        <div class="post-head">
          <img class="avatar" src="${avatar(post.author)}" alt="">
          <div class="grow"><strong>${post.author.username}</strong><span class="muted tiny">${timeAgo(post.createdAt)} ago</span></div>
          ${own ? `<button class="btn icon ghost" data-edit-post="${post._id}" title="Edit">${icons.edit}</button><button class="btn icon ghost" data-delete-post="${post._id}" title="Delete">${icons.trash}</button>` : ''}
        </div>
        <div class="post-text">${escapeHtml(post.content)}</div>
      </div>
      ${post.image ? `<img class="post-img" src="${post.image}" alt="">` : ''}
      <div class="post-actions">
        <button class="action ${post.likedByMe ? 'active' : ''}" data-like="${post._id}">${icons.heart}<span>${post.likeCount}</span></button>
        <button class="action" data-comments="${post._id}">${icons.comment}<span>${post.commentCount}</span></button>
        <button class="action" onclick="navigate('user','${post.author.username}')">${icons.user}<span>Profile</span></button>
        <button class="action" onclick="navigator.clipboard?.writeText(location.href); toast('Link copied.')">${icons.send}<span>Share</span></button>
      </div>
      <div class="comments" id="comments-${post._id}" hidden></div>
    </article>`;
}

async function likePost(id) {
  try {
    const data = await api(`/api/posts/${id}/like`, { method: 'POST' });
    state.posts = state.posts.map((post) => post._id === id ? data.post : post);
    renderPosts();
  } catch (err) { toast(err.message); }
}

async function toggleComments(id) {
  const box = $(`#comments-${id}`);
  box.hidden = !box.hidden;
  if (box.hidden) return;
  const data = await api(`/api/posts/${id}/comments`);
  box.innerHTML = `
    ${data.comments.map(commentView).join('') || '<div class="muted tiny">No comments yet.</div>'}
    <form class="searchbar" data-comment-form="${id}">
      <input class="input" name="text" maxlength="220" placeholder="Add a thoughtful comment..." required>
      <button class="btn icon">${icons.send}</button>
    </form>`;
  box.querySelectorAll('[data-delete-comment]').forEach((btn) => btn.onclick = () => deleteComment(id, btn.dataset.deleteComment));
  box.querySelector('form').onsubmit = (event) => addComment(event, id);
}

function commentView(comment) {
  const own = String(comment.userId._id) === String(state.user._id);
  return `<div class="comment"><img class="avatar" src="${avatar(comment.userId)}" alt=""><div class="grow"><strong>${comment.userId.username}</strong><div>${escapeHtml(comment.text)}</div></div>${own ? `<button class="btn icon ghost" data-delete-comment="${comment._id}">${icons.trash}</button>` : ''}</div>`;
}

async function addComment(event, id) {
  event.preventDefault();
  await api(`/api/posts/${id}/comments`, { method: 'POST', body: { text: event.currentTarget.text.value } });
  const post = state.posts.find((item) => item._id === id);
  if (post) post.commentCount += 1;
  await toggleComments(id);
  await toggleComments(id);
}

async function deleteComment(postId, commentId) {
  await api(`/api/posts/comments/${commentId}`, { method: 'DELETE' });
  const post = state.posts.find((item) => item._id === postId);
  if (post) post.commentCount = Math.max(0, post.commentCount - 1);
  await toggleComments(postId);
  await toggleComments(postId);
}

async function deletePost(id) {
  if (!confirm('Delete this post?')) return;
  await api(`/api/posts/${id}`, { method: 'DELETE' });
  state.posts = state.posts.filter((post) => post._id !== id);
  renderPosts();
  toast('Post deleted.');
}

function editPost(id) {
  const post = state.posts.find((item) => item._id === id);
  modal(`
    <div class="modal-head"><h3>Edit post</h3><button class="btn icon ghost" data-close>×</button></div>
    <form id="editPostForm" class="panel">
      <textarea name="content" maxlength="500" required>${escapeHtml(post.content)}</textarea>
      <button class="btn">Save changes</button>
    </form>`);
  $('#editPostForm').onsubmit = async (event) => {
    event.preventDefault();
    const data = await api(`/api/posts/${id}`, { method: 'PATCH', body: { content: event.currentTarget.content.value } });
    state.posts = state.posts.map((item) => item._id === id ? data.post : item);
    closeModal();
    renderPosts();
  };
}

async function loadSide() {
  const side = $('#sideCol');
  const [suggested, trending] = await Promise.all([api('/api/users/suggested'), api('/api/posts/trending')]);
  side.innerHTML = `
    <section class="panel">
      <h3>Profile Progress</h3>
      <div class="progress"><span style="width:${state.user.completion || 60}%"></span></div>
      <div class="muted tiny">${state.user.completion || 60}% complete</div>
    </section>
    <section class="panel"><h3>Suggested Users</h3>${suggested.users.map(userRow).join('') || '<div class="muted tiny">You are caught up.</div>'}</section>
    <section class="panel"><h3>Trending Posts</h3>${trending.posts.map((p) => `<div class="user-row"><img class="avatar" src="${avatar(p.author)}"><div class="grow"><strong>${p.author.username}</strong><div class="muted tiny">${escapeHtml(p.content.slice(0, 70))}</div></div></div>`).join('')}</section>`;
  side.querySelectorAll('[data-follow]').forEach((btn) => btn.onclick = () => follow(btn.dataset.follow));
}

function userRow(user) {
  return `<div class="user-row"><img class="avatar" src="${avatar(user)}" alt=""><div class="grow"><strong>${user.username}</strong><span class="muted tiny">${user.bio || 'New to Nexus'}</span></div>${!user.isMe ? `<button class="btn small secondary" data-follow="${user._id}">${user.isFollowing ? 'Following' : 'Follow'}</button>` : ''}</div>`;
}

async function follow(id) {
  try {
    await api(`/api/users/${id}/follow`, { method: 'POST' });
    toast('Network updated.');
    if ($('#sideCol')) loadSide();
  } catch (err) { toast(err.message); }
}

async function loadProfile(username) {
  shell('user');
  const main = $('#mainCol');
  main.innerHTML = skeletons(2);
  loadSide();
  const data = await api(`/api/users/${username}`);
  const user = data.user;
  main.innerHTML = `
    ${topbar(user.username)}
    <section class="panel">
      <div class="profile-head">
        <img class="avatar lg" src="${avatar(user)}" alt="">
        <div class="grow"><h2 style="margin:0">${user.username}</h2><p class="muted">${user.bio || 'No bio yet.'}</p></div>
        ${user.isMe ? `<button class="btn secondary" onclick="loadSettings()">Edit</button>` : `<button class="btn" data-follow="${user._id}">${user.isFollowing ? 'Following' : 'Follow'}</button>`}
      </div>
      <div class="stat-grid">
        <button class="stat" data-list="followers" data-id="${user._id}"><b>${user.followersCount}</b><span class="muted tiny">Followers</span></button>
        <button class="stat" data-list="following" data-id="${user._id}"><b>${user.followingCount}</b><span class="muted tiny">Following</span></button>
        <div class="stat"><b>${user.postsCount}</b><span class="muted tiny">Posts</span></div>
      </div>
      <div class="progress"><span style="width:${user.completion}%"></span></div>
    </section>
    <div id="posts">${skeletons(2)}</div>`;
  main.querySelectorAll('[data-follow]').forEach((btn) => btn.onclick = () => follow(btn.dataset.follow));
  main.querySelectorAll('[data-list]').forEach((btn) => btn.onclick = () => loadFollowList(btn.dataset.id, btn.dataset.list));
  const posts = await api(`/api/posts?author=${user._id}`);
  state.posts = posts.posts;
  renderPosts();
}

async function loadFollowList(id, type) {
  const data = await api(`/api/users/${id}/${type}`);
  modal(`<div class="modal-head"><h3>${type}</h3><button class="btn icon ghost" data-close>×</button></div><div class="panel">${data.users.map(userRow).join('') || '<div class="empty">No users yet.</div>'}</div>`);
}

function loadSearch() {
  shell('search');
  $('#mainCol').innerHTML = `${topbar('User Search')}<section class="panel"><div class="searchbar"><input class="input" id="searchInput" placeholder="Search username or bio"><button class="btn icon">${icons.search}</button></div><div id="searchResults"></div></section>`;
  loadSide();
  const input = $('#searchInput');
  let timer;
  input.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const data = await api(`/api/users/search?q=${encodeURIComponent(input.value)}`);
      $('#searchResults').innerHTML = data.users.map(userRow).join('') || '<div class="empty">No matching people found.</div>';
      $('#searchResults').querySelectorAll('[data-follow]').forEach((btn) => btn.onclick = () => follow(btn.dataset.follow));
    }, 220);
  };
  input.dispatchEvent(new Event('input'));
}

async function loadNotifications() {
  shell('bell');
  $('#mainCol').innerHTML = `${topbar('Notifications')}<section class="panel">${skeletons(2)}</section>`;
  loadSide();
  const data = await api('/api/notifications');
  const text = { like: 'liked your post', comment: 'commented on your post', follow: 'followed you' };
  $('#mainCol .panel').innerHTML = data.notifications.map((n) => `<div class="user-row"><img class="avatar" src="${avatar(n.actor)}"><div class="grow"><strong>${n.actor.username}</strong><span class="muted">${text[n.type]}</span><div class="tiny muted">${timeAgo(n.createdAt)} ago</div></div></div>`).join('') || '<div class="empty">No activity yet.</div>';
}

function loadSettings() {
  shell('settings');
  $('#mainCol').innerHTML = `
    ${topbar('Settings')}
    <form class="panel" id="profileForm">
      <div class="profile-head"><img class="avatar lg" id="avatarPreview" src="${avatar(state.user)}"><div><h3>Edit Profile</h3><p class="muted tiny">Keep your profile specific and credible.</p></div></div>
      <div class="field"><label>Avatar</label><input class="input" name="avatar" type="file" accept="image/*"></div>
      <div class="field"><label>Username</label><input class="input" name="username" value="${state.user.username}" required></div>
      <div class="field"><label>Bio</label><textarea name="bio" maxlength="180">${state.user.bio || ''}</textarea></div>
      <button class="btn">Save profile</button>
    </form>
    <section class="panel"><h3>Appearance</h3><button class="btn secondary" data-theme-toggle>${icons.moon} Toggle dark mode</button></section>`;
  $('#sideCol').innerHTML = '';
  const form = $('#profileForm');
  form.avatar.onchange = () => previewFile(form.avatar.files[0], $('#avatarPreview'));
  form.onsubmit = async (event) => {
    event.preventDefault();
    const data = await api('/api/users/me', { method: 'PATCH', body: new FormData(form) });
    state.user = { ...state.user, ...data.user };
    toast('Profile updated.');
    loadProfile(state.user.username);
  };
}

function modal(html) {
  document.body.insertAdjacentHTML('beforeend', `<div class="modal"><div class="modal-box">${html}</div></div>`);
  $('.modal').onclick = (event) => { if (event.target.matches('.modal,[data-close]')) closeModal(); };
}

function closeModal() {
  $('.modal')?.remove();
}

function skeletons(count) {
  return Array.from({ length: count }, () => '<div class="skeleton"></div>').join('');
}

function escapeHtml(value = '') {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

async function logout() {
  await api('/api/auth/logout', { method: 'POST' });
  state.user = null;
  state.page = 'landing';
  landing();
}

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-theme-toggle]')) {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = state.theme;
    localStorage.setItem('theme', state.theme);
  }
});

async function init() {
  bindGlobal();
  try {
    const data = await api('/api/auth/me');
    state.user = data.user;
    await loadHome();
  } catch {
    landing();
  }
}

init();

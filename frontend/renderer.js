// ChatPro Electron renderer logic
const API_URL = 'http://localhost:3001/api';
let token = localStorage.getItem('token');
let currentUser = null;
let users = [];
let selectedUser = null;

function showLogin() {
  document.body.innerHTML = `
    <div class="container mt-5">
      <div class="card mx-auto" style="max-width: 350px;">
        <div class="card-header bg-primary text-white">Entrar</div>
        <div class="card-body">
          <div class="mb-3">
              <input type="email" id="loginEmail" class="form-control" placeholder="Seu e-mail">
          </div>
          <div class="mb-3">
              <input type="password" id="loginPassword" class="form-control" placeholder="Sua senha">
          </div>
          <button class="btn btn-primary w-100" id="loginBtn">Entrar</button>
          <div class="text-danger mt-2" id="loginError"></div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('loginBtn').onclick = async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        token = data.token;
        localStorage.setItem('token', token);
        currentUser = data.user;
        location.reload();
      } else {
        document.getElementById('loginError').innerText = data.error || 'Falha no login';
      }
    } catch (e) {
      document.getElementById('loginError').innerText = 'Erro de conexão';
    }
  };
}

async function fetchUsers() {
  const res = await fetch(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  users = await res.json();
  renderUserList();
}

function renderUserList() {
  const userList = document.getElementById('userList');
  userList.innerHTML = '';
  users.forEach(u => {
    if (u.id === currentUser.id) return;
    const div = document.createElement('div');
    div.className = 'list-group-item user-item' + (selectedUser && selectedUser.id === u.id ? ' active' : '');
    div.innerHTML = u.name + (u.unread > 0 ? ` <span class='badge bg-danger float-end'>${u.unread}</span>` : '');
    div.onclick = () => {
      selectedUser = u;
      renderUserList();
      fetchMessages();
    };
    userList.appendChild(div);
  });
}

async function fetchMessages() {
  if (!selectedUser) return;
  const res = await fetch(`${API_URL}/messages/${selectedUser.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const messages = await res.json();
  // Set unread count to 0 for this user after opening chat
  const user = users.find(u => u.id === selectedUser.id);
  if (user) user.unread = 0;
  renderUserList();
  renderMessages(messages);
}

function renderMessages(messages) {
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = '';
  messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'message ' + (msg.sender_id === currentUser.id ? 'me' : 'them');
    let readStatus = '';
    if (msg.sender_id === currentUser.id) {
      readStatus = msg.is_read ? '<span class="text-success ms-2">✔✔ Lida</span>' : '<span class="text-muted ms-2">✔ Enviada</span>';
    }
    div.innerHTML = `<div class="bubble">${msg.content}<br><small class="text-secondary">${msg.formatted_time}${readStatus}</small></div>`;
    chatMessages.appendChild(div);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
  if (!selectedUser) return;
  const input = document.getElementById('messageInput');
  const content = input.value.trim();
  if (!content) return;
  await fetch(`${API_URL}/messages/${selectedUser.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });
  input.value = '';
  fetchMessages();
}

function setupChatEvents() {
  document.getElementById('sendBtn').onclick = sendMessage;
  document.getElementById('messageInput').onkeydown = e => {
    if (e.key === 'Enter') sendMessage();
  };
  document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('token');
    token = null;
    showLogin();
  };
}

async function pollNewMessages() {
  let lastMessageId = 0;
  setInterval(async () => {
    if (!selectedUser) return;
    const res = await fetch(`${API_URL}/messages/${selectedUser.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const messages = await res.json();
    if (messages.length && messages[messages.length - 1].id > lastMessageId) {
      lastMessageId = messages[messages.length - 1].id;
      if (messages[messages.length - 1].sender_id !== currentUser.id) {
        window.electronAPI.notifyMessage(`New message from ${selectedUser.name}`);
      }
      renderMessages(messages);
    }
  }, 2000);
}

function loadChat() {
  document.getElementById('currentUser').innerText = currentUser.name;
  fetchUsers();
  setupChatEvents();
  pollNewMessages();
}

window.onload = () => {
  if (!token) {
    showLogin();
  } else {
    // Try to get user info from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUser = { id: payload.id, name: payload.name, email: payload.email };
      loadChat();
    } catch {
      showLogin();
    }
  }
};

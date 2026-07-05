(() => {
  'use strict';

  const views = {
    folders: document.getElementById('sp-view-folders'),
    search: document.getElementById('sp-view-search'),
    treemap: document.getElementById('sp-view-treemap'),
    prompts: document.getElementById('sp-view-prompts'),
  };

  // ── Navigation ──
  document.querySelectorAll('.sp-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sp-nav-btn').forEach(b => b.classList.remove('sp-nav-active'));
      btn.classList.add('sp-nav-active');
      Object.values(views).forEach(v => v.classList.remove('sp-view-active'));
      views[btn.dataset.view].classList.add('sp-view-active');
      loadView(btn.dataset.view);
    });
  });

  function loadView(name) {
    switch (name) {
      case 'folders': loadFolders(); break;
      case 'search': loadSearch(); break;
      case 'treemap': loadTreeMap(); break;
      case 'prompts': loadPrompts(); break;
    }
  }

  // ── Folders View ──
  async function loadFolders() {
    const folders = await BharatStorage.getFolders();
    const chatMap = await BharatStorage.getChatFolderMap();
    const chatIndex = await BharatStorage.getChatIndex();

    let html = `
      <div class="sp-folder-actions">
        <button class="sp-btn sp-btn-primary" id="sp-add-folder">+ Folder</button>
        <button class="sp-btn" id="sp-add-subfolder">+ Sub-folder</button>
      </div>
      <div class="sp-folder-tree" id="sp-folder-tree">
    `;

    html += renderFolderTree(folders, chatMap, chatIndex, 0);

    // Unorganized chats
    const organizedIds = new Set(Object.keys(chatMap));
    const unorganized = chatIndex.filter(c => !organizedIds.has(c.id));
    if (unorganized.length > 0) {
      html += `
        <div class="sp-folder-item" data-folder-id="_unorganized">
          <span class="sp-folder-icon">📂</span>
          <span class="sp-folder-name">Unorganized</span>
          <span class="sp-folder-count">${unorganized.length}</span>
        </div>
        <div class="sp-chat-list sp-subfolder" id="sp-unorganized-chats">
          ${unorganized.map(c => renderChatItem(c)).join('')}
        </div>
      `;
    }

    html += '</div>';
    views.folders.innerHTML = html;

    // Events
    document.getElementById('sp-add-folder')?.addEventListener('click', async () => {
      const name = prompt('Folder name:');
      if (!name) return;
      folders.push({ id: BharatStorage.generateId(), name, children: [] });
      await BharatStorage.saveFolders(folders);
      loadFolders();
    });

    document.getElementById('sp-add-subfolder')?.addEventListener('click', async () => {
      if (folders.length === 0) { alert('Create a folder first'); return; }
      const parentName = prompt('Parent folder name:');
      const parent = findFolder(folders, f => f.name.toLowerCase() === parentName?.toLowerCase());
      if (!parent) { alert('Folder not found'); return; }
      const name = prompt('Sub-folder name:');
      if (!name) return;
      if (!parent.children) parent.children = [];
      parent.children.push({ id: BharatStorage.generateId(), name, children: [] });
      await BharatStorage.saveFolders(folders);
      loadFolders();
    });

    // Drag-drop for chat assignment
    views.folders.querySelectorAll('.sp-chat-item').forEach(el => {
      el.setAttribute('draggable', 'true');
      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', el.dataset.chatId);
      });
    });

    views.folders.querySelectorAll('.sp-folder-item').forEach(el => {
      el.addEventListener('dragover', e => e.preventDefault());
      el.addEventListener('drop', async e => {
        e.preventDefault();
        const chatId = e.dataTransfer.getData('text/plain');
        const folderId = el.dataset.folderId;
        if (chatId && folderId && folderId !== '_unorganized') {
          chatMap[chatId] = folderId;
          await BharatStorage.saveChatFolderMap(chatMap);
          loadFolders();
        }
      });
    });

    // Delete folder on right-click
    views.folders.querySelectorAll('.sp-folder-item').forEach(el => {
      el.addEventListener('contextmenu', async e => {
        e.preventDefault();
        const folderId = el.dataset.folderId;
        if (folderId === '_unorganized') return;
        if (!confirm('Delete this folder?')) return;
        const updated = removeFolder(folders, folderId);
        await BharatStorage.saveFolders(updated);
        // Remove chat mappings
        for (const [cid, fid] of Object.entries(chatMap)) {
          if (fid === folderId) delete chatMap[cid];
        }
        await BharatStorage.saveChatFolderMap(chatMap);
        loadFolders();
      });
    });
  }

  function renderFolderTree(folders, chatMap, chatIndex, depth) {
    let html = '';
    for (const folder of folders) {
      const chatsInFolder = chatIndex.filter(c => chatMap[c.id] === folder.id);
      const indent = depth > 0 ? ' sp-subfolder' : '';
      html += `
        <div class="sp-folder-item${indent}" data-folder-id="${folder.id}">
          <span class="sp-folder-icon">${depth > 0 ? '📁' : '📂'}</span>
          <span class="sp-folder-name">${escHTML(folder.name)}</span>
          <span class="sp-folder-count">${chatsInFolder.length}</span>
        </div>
      `;
      if (chatsInFolder.length > 0) {
        html += `<div class="sp-chat-list sp-subfolder">${chatsInFolder.map(c => renderChatItem(c)).join('')}</div>`;
      }
      if (folder.children && folder.children.length > 0) {
        html += renderFolderTree(folder.children, chatMap, chatIndex, depth + 1);
      }
    }
    return html;
  }

  function renderChatItem(chat) {
    return `
      <div class="sp-chat-item" data-chat-id="${chat.id}" data-url="${chat.url || ''}">
        <span class="sp-chat-title">${escHTML(chat.title)}</span>
        <span class="sp-chat-platform">${chat.platform}</span>
      </div>
    `;
  }

  function findFolder(folders, predicate) {
    for (const f of folders) {
      if (predicate(f)) return f;
      if (f.children) {
        const found = findFolder(f.children, predicate);
        if (found) return found;
      }
    }
    return null;
  }

  function removeFolder(folders, id) {
    return folders.filter(f => {
      if (f.id === id) return false;
      if (f.children) f.children = removeFolder(f.children, id);
      return true;
    });
  }

  // ── Search View ──
  async function loadSearch() {
    const chatIndex = await BharatStorage.getChatIndex();

    views.search.innerHTML = `
      <div class="sp-search-box">
        <input type="text" id="sp-search-input" placeholder="Search conversations...">
      </div>
      <div class="sp-search-results" id="sp-search-results">
        <p class="sp-empty">Type to search across ${chatIndex.length} indexed conversations.</p>
      </div>
    `;

    const input = document.getElementById('sp-search-input');
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      const results = document.getElementById('sp-search-results');
      if (!q) {
        results.innerHTML = `<p class="sp-empty">Type to search across ${chatIndex.length} indexed conversations.</p>`;
        return;
      }
      const matches = chatIndex.filter(c => c.title.toLowerCase().includes(q));
      if (matches.length === 0) {
        results.innerHTML = '<p class="sp-empty">No matches found.</p>';
        return;
      }
      results.innerHTML = matches.map(c => `
        <div class="sp-search-result" data-url="${c.url || ''}">
          <h4>${highlightMatch(c.title, q)}</h4>
          <p>${c.platform} &middot; ${c.messageCount} messages &middot; ${timeAgo(c.lastVisited)}</p>
        </div>
      `).join('');

      results.querySelectorAll('.sp-search-result').forEach(el => {
        el.addEventListener('click', () => {
          if (el.dataset.url) chrome.tabs.create({ url: el.dataset.url });
        });
      });
    });
  }

  function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx < 0) return escHTML(text);
    return escHTML(text.slice(0, idx)) +
      '<mark>' + escHTML(text.slice(idx, idx + query.length)) + '</mark>' +
      escHTML(text.slice(idx + query.length));
  }

  // ── Tree Map View ──
  async function loadTreeMap() {
    const chatIndex = await BharatStorage.getChatIndex();

    if (chatIndex.length === 0) {
      views.treemap.innerHTML = '<p class="sp-empty">No conversations indexed yet. Visit some chats first.</p>';
      return;
    }

    const colors = ['#5c6bc0', '#26a69a', '#ef5350', '#ab47bc', '#ff7043', '#66bb6a', '#42a5f5', '#ffa726'];

    const sorted = [...chatIndex].sort((a, b) => b.messageCount - a.messageCount);
    const maxMsgs = sorted[0].messageCount || 1;

    views.treemap.innerHTML = `
      <p style="margin-bottom:10px;color:#666;font-size:12px;">
        Visual map of conversations by length. Larger = more messages.
      </p>
      <div class="sp-treemap-container">
        ${sorted.map((c, i) => {
          const size = Math.max(40, Math.round((c.messageCount / maxMsgs) * 100));
          const color = colors[i % colors.length];
          return `<div class="sp-treemap-block" style="background:${color};min-height:${size}px"
                       title="${escHTML(c.title)} (${c.messageCount} msgs)" data-url="${c.url || ''}">
            ${escHTML(c.title.slice(0, 20))}
          </div>`;
        }).join('')}
      </div>
    `;

    views.treemap.querySelectorAll('.sp-treemap-block').forEach(el => {
      el.addEventListener('click', () => {
        if (el.dataset.url) chrome.tabs.create({ url: el.dataset.url });
      });
    });
  }

  // ── Prompts View (sidepanel) ──
  async function loadPrompts() {
    const prompts = await BharatStorage.getPrompts();

    if (prompts.length === 0) {
      views.prompts.innerHTML = '<p class="sp-empty">No prompts saved yet. Use the toolbar on ChatGPT/Claude to create prompts.</p>';
      return;
    }

    views.prompts.innerHTML = `
      <div class="sp-prompts-list">
        ${prompts.map(p => `
          <div class="sp-prompt-item" data-id="${p.id}">
            <h4>${escHTML(p.name)} ${p.category ? `<span style="font-size:10px;color:#666">[${p.category}]</span>` : ''}</h4>
            <p>${escHTML(p.text.slice(0, 100))}${p.text.length > 100 ? '...' : ''}</p>
            <button class="sp-btn sp-btn-sm sp-use-prompt" data-id="${p.id}">Insert</button>
            <button class="sp-btn sp-btn-sm sp-copy-prompt" data-id="${p.id}">Copy</button>
          </div>
        `).join('')}
      </div>
    `;

    views.prompts.querySelectorAll('.sp-use-prompt').forEach(btn => {
      btn.addEventListener('click', async () => {
        const p = prompts.find(x => x.id === btn.dataset.id);
        if (!p) return;
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) chrome.tabs.sendMessage(tab.id, { type: 'BP_INSERT_PROMPT', text: p.text });
      });
    });

    views.prompts.querySelectorAll('.sp-copy-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = prompts.find(x => x.id === btn.dataset.id);
        if (p) navigator.clipboard.writeText(p.text);
      });
    });
  }

  // ── Helpers ──
  function escHTML(str) {
    const d = document.createElement('span');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // Init
  loadFolders();
})();

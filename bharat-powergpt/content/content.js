(() => {
  'use strict';

  // ── Floating Action Button ──
  function createFAB() {
    if (document.getElementById('bp-fab')) return;

    const fab = document.createElement('div');
    fab.id = 'bp-fab';
    fab.title = 'Bharat PowerGPT';
    fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>`;
    fab.addEventListener('click', toggleToolbar);
    document.body.appendChild(fab);
  }

  // ── Toolbar (slide-in panel on page) ──
  let toolbarOpen = false;

  function toggleToolbar() {
    let tb = document.getElementById('bp-toolbar');
    if (tb) {
      toolbarOpen = !toolbarOpen;
      tb.classList.toggle('bp-open', toolbarOpen);
      return;
    }
    toolbarOpen = true;
    tb = document.createElement('div');
    tb.id = 'bp-toolbar';
    tb.classList.add('bp-open');
    tb.innerHTML = buildToolbarHTML();
    document.body.appendChild(tb);
    initToolbarEvents(tb);
  }

  function buildToolbarHTML() {
    return `
      <div class="bp-toolbar-header">
        <span class="bp-logo">B</span>
        <span class="bp-title">Bharat PowerGPT</span>
        <button class="bp-close" id="bp-close-toolbar">&times;</button>
      </div>
      <div class="bp-tabs">
        <button class="bp-tab bp-tab-active" data-tab="prompts">Prompts</button>
        <button class="bp-tab" data-tab="export">Export</button>
        <button class="bp-tab" data-tab="highlight">Highlight</button>
        <button class="bp-tab" data-tab="notes">Notes</button>
      </div>
      <div class="bp-tab-content" id="bp-tab-content">
        ${buildPromptsTab()}
      </div>
    `;
  }

  function buildPromptsTab() {
    return `
      <div class="bp-section" id="bp-prompts-section">
        <div class="bp-prompt-actions">
          <input type="text" id="bp-prompt-search" class="bp-input" placeholder="Search prompts...">
          <button class="bp-btn bp-btn-primary" id="bp-add-prompt">+ New Prompt</button>
        </div>
        <div id="bp-prompt-list" class="bp-prompt-list"></div>
        <div id="bp-prompt-form" class="bp-prompt-form bp-hidden">
          <input type="text" id="bp-prompt-name" class="bp-input" placeholder="Prompt name">
          <select id="bp-prompt-category" class="bp-input">
            <option value="">No category</option>
            <option value="coding">Coding</option>
            <option value="writing">Writing</option>
            <option value="analysis">Analysis</option>
            <option value="creative">Creative</option>
            <option value="business">Business</option>
          </select>
          <textarea id="bp-prompt-text" class="bp-textarea" placeholder="Prompt text... Use {{variable}} for placeholders"></textarea>
          <div class="bp-prompt-form-actions">
            <button class="bp-btn bp-btn-primary" id="bp-save-prompt">Save</button>
            <button class="bp-btn" id="bp-cancel-prompt">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  function buildExportTab() {
    return `
      <div class="bp-section">
        <p class="bp-label">Export current conversation</p>
        <div class="bp-export-buttons">
          <button class="bp-btn" data-format="md">Markdown</button>
          <button class="bp-btn" data-format="json">JSON</button>
          <button class="bp-btn" data-format="txt">Text</button>
          <button class="bp-btn" data-format="pdf">HTML/PDF</button>
        </div>
        <hr class="bp-divider">
        <p class="bp-label">Bulk export visible chats</p>
        <div class="bp-export-buttons">
          <button class="bp-btn" id="bp-bulk-export-md">All as Markdown</button>
          <button class="bp-btn" id="bp-bulk-export-json">All as JSON</button>
        </div>
      </div>
    `;
  }

  function buildHighlightTab() {
    return `
      <div class="bp-section">
        <p class="bp-label">Select text on the page, then click a color to highlight:</p>
        <div class="bp-highlight-colors">
          <button class="bp-color-btn" data-color="#fff59d" style="background:#fff59d" title="Yellow"></button>
          <button class="bp-color-btn" data-color="#a5d6a7" style="background:#a5d6a7" title="Green"></button>
          <button class="bp-color-btn" data-color="#90caf9" style="background:#90caf9" title="Blue"></button>
          <button class="bp-color-btn" data-color="#ef9a9a" style="background:#ef9a9a" title="Red"></button>
          <button class="bp-color-btn" data-color="#ce93d8" style="background:#ce93d8" title="Purple"></button>
        </div>
        <button class="bp-btn" id="bp-clear-highlights">Clear All Highlights</button>
        <hr class="bp-divider">
        <div id="bp-highlight-list" class="bp-highlight-list"></div>
      </div>
    `;
  }

  function buildNotesTab() {
    return `
      <div class="bp-section">
        <button class="bp-btn bp-btn-primary" id="bp-add-note">+ Add Note</button>
        <div id="bp-notes-list" class="bp-notes-list"></div>
      </div>
    `;
  }

  // ── Toolbar Events ──
  function initToolbarEvents(tb) {
    tb.querySelector('#bp-close-toolbar').addEventListener('click', () => {
      toolbarOpen = false;
      tb.classList.remove('bp-open');
    });

    tb.querySelectorAll('.bp-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tb.querySelectorAll('.bp-tab').forEach(t => t.classList.remove('bp-tab-active'));
        tab.classList.add('bp-tab-active');
        const content = tb.querySelector('#bp-tab-content');
        switch (tab.dataset.tab) {
          case 'prompts': content.innerHTML = buildPromptsTab(); initPromptsTab(tb); break;
          case 'export': content.innerHTML = buildExportTab(); initExportTab(tb); break;
          case 'highlight': content.innerHTML = buildHighlightTab(); initHighlightTab(tb); break;
          case 'notes': content.innerHTML = buildNotesTab(); initNotesTab(tb); break;
        }
      });
    });

    initPromptsTab(tb);
  }

  // ── Prompts Tab ──
  async function initPromptsTab(tb) {
    const prompts = await BharatStorage.getPrompts();
    renderPromptList(tb, prompts);

    const addBtn = tb.querySelector('#bp-add-prompt');
    const form = tb.querySelector('#bp-prompt-form');
    const saveBtn = tb.querySelector('#bp-save-prompt');
    const cancelBtn = tb.querySelector('#bp-cancel-prompt');
    const searchInput = tb.querySelector('#bp-prompt-search');

    if (addBtn) addBtn.addEventListener('click', () => {
      form.classList.remove('bp-hidden');
      form.dataset.editId = '';
      tb.querySelector('#bp-prompt-name').value = '';
      tb.querySelector('#bp-prompt-category').value = '';
      tb.querySelector('#bp-prompt-text').value = '';
    });

    if (cancelBtn) cancelBtn.addEventListener('click', () => form.classList.add('bp-hidden'));

    if (saveBtn) saveBtn.addEventListener('click', async () => {
      const name = tb.querySelector('#bp-prompt-name').value.trim();
      const text = tb.querySelector('#bp-prompt-text').value.trim();
      const category = tb.querySelector('#bp-prompt-category').value;
      if (!name || !text) return;

      const prompts = await BharatStorage.getPrompts();
      const editId = form.dataset.editId;

      if (editId) {
        const idx = prompts.findIndex(p => p.id === editId);
        if (idx >= 0) Object.assign(prompts[idx], { name, text, category, updatedAt: Date.now() });
      } else {
        prompts.push({ id: BharatStorage.generateId(), name, text, category, createdAt: Date.now(), usageCount: 0 });
      }

      await BharatStorage.savePrompts(prompts);
      form.classList.add('bp-hidden');
      renderPromptList(tb, prompts);
    });

    if (searchInput) searchInput.addEventListener('input', async () => {
      const q = searchInput.value.toLowerCase();
      const prompts = await BharatStorage.getPrompts();
      const filtered = prompts.filter(p => p.name.toLowerCase().includes(q) || p.text.toLowerCase().includes(q));
      renderPromptList(tb, filtered);
    });
  }

  function renderPromptList(tb, prompts) {
    const list = tb.querySelector('#bp-prompt-list');
    if (!list) return;

    if (prompts.length === 0) {
      list.innerHTML = '<p class="bp-empty">No prompts saved yet. Click "+ New Prompt" to create one.</p>';
      return;
    }

    list.innerHTML = prompts.map(p => `
      <div class="bp-prompt-card" data-id="${p.id}">
        <div class="bp-prompt-card-header">
          <strong>${escHTML(p.name)}</strong>
          ${p.category ? `<span class="bp-badge">${escHTML(p.category)}</span>` : ''}
        </div>
        <p class="bp-prompt-preview">${escHTML(p.text.slice(0, 120))}${p.text.length > 120 ? '...' : ''}</p>
        <div class="bp-prompt-card-actions">
          <button class="bp-btn bp-btn-sm bp-use-prompt" data-id="${p.id}">Use</button>
          <button class="bp-btn bp-btn-sm bp-edit-prompt" data-id="${p.id}">Edit</button>
          <button class="bp-btn bp-btn-sm bp-btn-danger bp-delete-prompt" data-id="${p.id}">Delete</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.bp-use-prompt').forEach(btn => {
      btn.addEventListener('click', async () => {
        const p = prompts.find(x => x.id === btn.dataset.id);
        if (p) {
          let text = p.text;
          const vars = text.match(/\{\{(\w+)\}\}/g);
          if (vars) {
            for (const v of vars) {
              const name = v.replace(/[{}]/g, '');
              const val = prompt(`Enter value for "${name}":`);
              if (val !== null) text = text.replace(v, val);
            }
          }
          PlatformAdapter.insertTextIntoInput(text);
          p.usageCount = (p.usageCount || 0) + 1;
          await BharatStorage.savePrompts(prompts);
        }
      });
    });

    list.querySelectorAll('.bp-edit-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = prompts.find(x => x.id === btn.dataset.id);
        if (p) {
          const form = tb.querySelector('#bp-prompt-form');
          form.classList.remove('bp-hidden');
          form.dataset.editId = p.id;
          tb.querySelector('#bp-prompt-name').value = p.name;
          tb.querySelector('#bp-prompt-category').value = p.category || '';
          tb.querySelector('#bp-prompt-text').value = p.text;
        }
      });
    });

    list.querySelectorAll('.bp-delete-prompt').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this prompt?')) return;
        const updated = prompts.filter(x => x.id !== btn.dataset.id);
        await BharatStorage.savePrompts(updated);
        renderPromptList(tb, updated);
      });
    });
  }

  // ── Export Tab ──
  function initExportTab(tb) {
    tb.querySelectorAll('[data-format]').forEach(btn => {
      btn.addEventListener('click', () => {
        const chat = getCurrentChat();
        if (!chat) { showToast('No conversation found on this page.'); return; }

        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('lib/export.js');
        script.onload = () => {
          BharatExport.exportChat(chat, btn.dataset.format);
          script.remove();
        };
        document.head.appendChild(script);
      });
    });
  }

  function getCurrentChat() {
    const messages = PlatformAdapter.getMessages();
    if (messages.length === 0) return null;
    return {
      id: PlatformAdapter.getCurrentChatId() || BharatStorage.generateId(),
      title: PlatformAdapter.getChatTitle(),
      platform: PlatformAdapter.name,
      timestamp: Date.now(),
      messages
    };
  }

  // ── Highlight Tab ──
  function initHighlightTab(tb) {
    tb.querySelectorAll('.bp-color-btn').forEach(btn => {
      btn.addEventListener('click', () => applyHighlight(btn.dataset.color));
    });

    tb.querySelector('#bp-clear-highlights')?.addEventListener('click', async () => {
      document.querySelectorAll('.bp-highlight').forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
      });
      const chatId = PlatformAdapter.getCurrentChatId();
      if (chatId) {
        const highlights = await BharatStorage.getHighlights();
        delete highlights[chatId];
        await BharatStorage.saveHighlights(highlights);
      }
      loadHighlightList(tb);
    });

    loadHighlightList(tb);
  }

  function applyHighlight(color) {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
      showToast('Select some text first');
      return;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.classList.add('bp-highlight');
    span.style.backgroundColor = color;
    span.dataset.color = color;

    try {
      range.surroundContents(span);
    } catch {
      showToast('Cannot highlight across element boundaries');
      return;
    }

    selection.removeAllRanges();
    saveHighlights();
  }

  async function saveHighlights() {
    const chatId = PlatformAdapter.getCurrentChatId();
    if (!chatId) return;

    const items = [];
    document.querySelectorAll('.bp-highlight').forEach(el => {
      items.push({ text: el.textContent, color: el.dataset.color });
    });

    const highlights = await BharatStorage.getHighlights();
    highlights[chatId] = items;
    await BharatStorage.saveHighlights(highlights);
  }

  async function loadHighlightList(tb) {
    const chatId = PlatformAdapter.getCurrentChatId();
    const list = tb.querySelector('#bp-highlight-list');
    if (!list || !chatId) return;

    const highlights = await BharatStorage.getHighlights();
    const items = highlights[chatId] || [];

    if (items.length === 0) {
      list.innerHTML = '<p class="bp-empty">No highlights in this chat.</p>';
      return;
    }

    list.innerHTML = items.map(h =>
      `<div class="bp-highlight-item" style="border-left:4px solid ${h.color}">
        <span>${escHTML(h.text.slice(0, 80))}</span>
      </div>`
    ).join('');
  }

  // ── Notes Tab ──
  async function initNotesTab(tb) {
    const chatId = PlatformAdapter.getCurrentChatId();
    const addBtn = tb.querySelector('#bp-add-note');

    if (addBtn) addBtn.addEventListener('click', async () => {
      const text = prompt('Enter your note:');
      if (!text) return;

      const notes = await BharatStorage.getNotes();
      const key = chatId || '_global';
      if (!notes[key]) notes[key] = [];
      notes[key].push({ id: BharatStorage.generateId(), text, createdAt: Date.now() });
      await BharatStorage.saveNotes(notes);
      renderNotes(tb, notes[key]);
    });

    const notes = await BharatStorage.getNotes();
    const key = chatId || '_global';
    renderNotes(tb, notes[key] || []);
  }

  function renderNotes(tb, notesList) {
    const container = tb.querySelector('#bp-notes-list');
    if (!container) return;

    if (notesList.length === 0) {
      container.innerHTML = '<p class="bp-empty">No notes yet.</p>';
      return;
    }

    container.innerHTML = notesList.map(n => `
      <div class="bp-note-card">
        <p>${escHTML(n.text)}</p>
        <div class="bp-note-meta">
          <small>${new Date(n.createdAt).toLocaleDateString()}</small>
          <button class="bp-btn bp-btn-sm bp-btn-danger bp-delete-note" data-id="${n.id}">Delete</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.bp-delete-note').forEach(btn => {
      btn.addEventListener('click', async () => {
        const chatId = PlatformAdapter.getCurrentChatId() || '_global';
        const notes = await BharatStorage.getNotes();
        notes[chatId] = (notes[chatId] || []).filter(n => n.id !== btn.dataset.id);
        await BharatStorage.saveNotes(notes);
        renderNotes(tb, notes[chatId]);
      });
    });
  }

  // ── Toast notification ──
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'bp-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('bp-toast-show'), 10);
    setTimeout(() => { toast.classList.remove('bp-toast-show'); setTimeout(() => toast.remove(), 300); }, 2500);
  }

  // ── Helpers ──
  function escHTML(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  // ── Chat indexing for search (via side panel) ──
  async function indexCurrentChat() {
    const chatId = PlatformAdapter.getCurrentChatId();
    if (!chatId) return;

    const index = await BharatStorage.getChatIndex();
    const existing = index.findIndex(c => c.id === chatId);
    const entry = {
      id: chatId,
      title: PlatformAdapter.getChatTitle(),
      platform: PlatformAdapter.name,
      messageCount: PlatformAdapter.getMessages().length,
      lastVisited: Date.now(),
      url: window.location.href
    };

    if (existing >= 0) {
      index[existing] = entry;
    } else {
      index.push(entry);
    }
    await BharatStorage.saveChatIndex(index);
  }

  // ── Message listener for side panel communication ──
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'BP_GET_CHAT') {
      sendResponse(getCurrentChat());
    } else if (msg.type === 'BP_GET_CHAT_LIST') {
      sendResponse(PlatformAdapter.getChatList());
    } else if (msg.type === 'BP_INSERT_PROMPT') {
      PlatformAdapter.insertTextIntoInput(msg.text);
      sendResponse({ ok: true });
    } else if (msg.type === 'BP_EXPORT_CHAT') {
      const chat = getCurrentChat();
      if (chat) {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('lib/export.js');
        script.onload = () => {
          BharatExport.exportChat(chat, msg.format);
          script.remove();
        };
        document.head.appendChild(script);
      }
      sendResponse({ ok: !!chat });
    }
    return true;
  });

  // ── Init ──
  function init() {
    createFAB();
    setTimeout(indexCurrentChat, 2000);

    const observer = new MutationObserver(() => {
      setTimeout(indexCurrentChat, 1000);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

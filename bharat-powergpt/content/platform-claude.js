const PlatformAdapter = {
  name: 'claude',

  getChatListSelector() {
    return 'nav a[href^="/chat/"]';
  },

  getMessageSelector() {
    return '[data-testid="user-message"], [data-testid="ai-message"], .font-user-message, .font-claude-message';
  },

  getInputSelector() {
    return '[contenteditable="true"].ProseMirror, fieldset textarea';
  },

  getChatTitle() {
    const btn = document.querySelector('button[data-testid="chat-title"]');
    if (btn) return btn.textContent.trim();
    const h = document.querySelector('h1');
    return h ? h.textContent.trim() : 'Untitled Chat';
  },

  getCurrentChatId() {
    const match = window.location.pathname.match(/\/chat\/([a-f0-9-]+)/);
    return match ? match[1] : null;
  },

  getMessages() {
    const messages = [];
    const userMsgs = document.querySelectorAll('[data-testid="user-message"], .font-user-message');
    const aiMsgs = document.querySelectorAll('[data-testid="ai-message"], .font-claude-message');

    const all = [];
    userMsgs.forEach(el => all.push({ el, role: 'user' }));
    aiMsgs.forEach(el => all.push({ el, role: 'assistant' }));

    all.sort((a, b) => {
      const pos = a.el.compareDocumentPosition(b.el);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    all.forEach(({ role, el }) => {
      const content = el.textContent.trim();
      if (content) messages.push({ role, content });
    });

    return messages;
  },

  getChatList() {
    const chats = [];
    document.querySelectorAll(this.getChatListSelector()).forEach(el => {
      const title = el.textContent.trim();
      const href = el.getAttribute('href');
      if (href) {
        const id = href.replace('/chat/', '');
        chats.push({ id, title, platform: 'claude' });
      }
    });
    return chats;
  },

  insertTextIntoInput(text) {
    const input = document.querySelector(this.getInputSelector());
    if (input) {
      input.focus();
      if (input.tagName === 'TEXTAREA') {
        document.execCommand('insertText', false, text);
      } else {
        document.execCommand('insertText', false, text);
      }
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
};

const PlatformAdapter = {
  name: 'chatgpt',

  getChatListSelector() {
    return 'nav ol > li a, nav ul > li a';
  },

  getMessageSelector() {
    return '[data-message-author-role]';
  },

  getInputSelector() {
    return '#prompt-textarea, textarea[data-id="root"]';
  },

  getChatTitle() {
    const el = document.querySelector('h1') || document.querySelector('title');
    return el ? el.textContent.trim() : 'Untitled Chat';
  },

  getCurrentChatId() {
    const match = window.location.pathname.match(/\/c\/([a-f0-9-]+)/);
    return match ? match[1] : null;
  },

  getMessages() {
    const messages = [];
    const els = document.querySelectorAll(this.getMessageSelector());
    els.forEach(el => {
      const role = el.getAttribute('data-message-author-role');
      const content = el.textContent.trim();
      if (content) {
        messages.push({ role: role === 'user' ? 'user' : 'assistant', content });
      }
    });
    return messages;
  },

  getChatList() {
    const chats = [];
    document.querySelectorAll(this.getChatListSelector()).forEach(el => {
      const title = el.textContent.trim();
      const href = el.getAttribute('href');
      if (href && href.startsWith('/c/')) {
        const id = href.replace('/c/', '');
        chats.push({ id, title, platform: 'chatgpt' });
      }
    });
    return chats;
  },

  insertTextIntoInput(text) {
    const input = document.querySelector(this.getInputSelector());
    if (input) {
      input.focus();
      document.execCommand('insertText', false, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
};

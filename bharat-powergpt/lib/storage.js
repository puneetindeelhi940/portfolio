const BharatStorage = {
  async get(key) {
    return new Promise(resolve => {
      chrome.storage.local.get(key, result => resolve(result[key]));
    });
  },

  async set(key, value) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  },

  async getAll() {
    return new Promise(resolve => {
      chrome.storage.local.get(null, resolve);
    });
  },

  async remove(key) {
    return new Promise(resolve => {
      chrome.storage.local.remove(key, resolve);
    });
  },

  // Folders
  async getFolders() {
    return (await this.get('bp_folders')) || [];
  },

  async saveFolders(folders) {
    return this.set('bp_folders', folders);
  },

  // Chat-to-folder mapping
  async getChatFolderMap() {
    return (await this.get('bp_chat_folder_map')) || {};
  },

  async saveChatFolderMap(map) {
    return this.set('bp_chat_folder_map', map);
  },

  // Prompts
  async getPrompts() {
    return (await this.get('bp_prompts')) || [];
  },

  async savePrompts(prompts) {
    return this.set('bp_prompts', prompts);
  },

  // Highlights
  async getHighlights() {
    return (await this.get('bp_highlights')) || {};
  },

  async saveHighlights(highlights) {
    return this.set('bp_highlights', highlights);
  },

  // Notes
  async getNotes() {
    return (await this.get('bp_notes')) || {};
  },

  async saveNotes(notes) {
    return this.set('bp_notes', notes);
  },

  // Chat history index (for search)
  async getChatIndex() {
    return (await this.get('bp_chat_index')) || [];
  },

  async saveChatIndex(index) {
    return this.set('bp_chat_index', index);
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
};

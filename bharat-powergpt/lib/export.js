const BharatExport = {
  toMarkdown(chat) {
    let md = `# ${chat.title}\n\n`;
    md += `**Platform:** ${chat.platform}\n`;
    md += `**Date:** ${new Date(chat.timestamp).toLocaleString()}\n\n---\n\n`;
    for (const msg of chat.messages) {
      const role = msg.role === 'user' ? '**You**' : '**Assistant**';
      md += `${role}:\n\n${msg.content}\n\n---\n\n`;
    }
    return md;
  },

  toJSON(chat) {
    return JSON.stringify(chat, null, 2);
  },

  toTXT(chat) {
    let txt = `${chat.title}\n${'='.repeat(chat.title.length)}\n\n`;
    txt += `Platform: ${chat.platform}\n`;
    txt += `Date: ${new Date(chat.timestamp).toLocaleString()}\n\n`;
    for (const msg of chat.messages) {
      const role = msg.role === 'user' ? 'You' : 'Assistant';
      txt += `[${role}]:\n${msg.content}\n\n`;
    }
    return txt;
  },

  toHTML(chat) {
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${this._esc(chat.title)}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#222}
.msg{margin:1rem 0;padding:1rem;border-radius:8px}
.user{background:#f0f4ff}.assistant{background:#f5f5f5}
.role{font-weight:700;margin-bottom:.5rem}
h1{border-bottom:2px solid #eee;padding-bottom:.5rem}
</style></head><body>
<h1>${this._esc(chat.title)}</h1>
<p><strong>Platform:</strong> ${this._esc(chat.platform)} | <strong>Date:</strong> ${new Date(chat.timestamp).toLocaleString()}</p>`;
    for (const msg of chat.messages) {
      const cls = msg.role === 'user' ? 'user' : 'assistant';
      const role = msg.role === 'user' ? 'You' : 'Assistant';
      html += `<div class="msg ${cls}"><div class="role">${role}</div><div>${this._esc(msg.content).replace(/\n/g, '<br>')}</div></div>`;
    }
    html += '</body></html>';
    return html;
  },

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  download(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  exportChat(chat, format) {
    const safeName = chat.title.replace(/[^a-z0-9]/gi, '_').slice(0, 50);
    switch (format) {
      case 'md':
        this.download(this.toMarkdown(chat), `${safeName}.md`, 'text/markdown');
        break;
      case 'json':
        this.download(this.toJSON(chat), `${safeName}.json`, 'application/json');
        break;
      case 'txt':
        this.download(this.toTXT(chat), `${safeName}.txt`, 'text/plain');
        break;
      case 'pdf':
        this.download(this.toHTML(chat), `${safeName}.html`, 'text/html');
        break;
    }
  },

  exportBulk(chats, format) {
    for (const chat of chats) {
      this.exportChat(chat, format);
    }
  }
};

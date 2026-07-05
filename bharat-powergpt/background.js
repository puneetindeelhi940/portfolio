chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'bp-highlight-selection',
    title: 'Highlight with Bharat PowerGPT',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'bp-save-as-prompt',
    title: 'Save as Prompt',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'bp-highlight-selection') {
    chrome.tabs.sendMessage(tab.id, {
      type: 'BP_CONTEXT_HIGHLIGHT',
      text: info.selectionText
    });
  } else if (info.menuItemId === 'bp-save-as-prompt') {
    const prompts = (await chrome.storage.local.get('bp_prompts')).bp_prompts || [];
    prompts.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: info.selectionText.slice(0, 50),
      text: info.selectionText,
      category: '',
      createdAt: Date.now(),
      usageCount: 0
    });
    await chrome.storage.local.set({ bp_prompts: prompts });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'BP_OPEN_SIDEPANEL') {
    chrome.sidePanel.open({ tabId: sender.tab.id });
  }
  return true;
});

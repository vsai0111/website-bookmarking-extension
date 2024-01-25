// Send a message to the background script when a bookmark is added
chrome.runtime.sendMessage({
  type: 'BOOKMARK_ADDED',
  payload: {
    title: document.title,
    url: window.location.href
  }
});

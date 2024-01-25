chrome.runtime.sendMessage({
    type: 'BOOKMARK_ADDED',
    payload: {
      title: document.title,
      url: window.location.href
    }
  });
  
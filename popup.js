document.getElementById('bookmarkButton').addEventListener('click', () => {
    chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
      const tabs = currentWindow.tabs;
      const bookmarks = [];
  
      tabs.forEach((tab) => {
        bookmarks.push({ url: tab.url, title: tab.title });
      });
  
      chrome.storage.sync.get('bookmarks', (data) => {
        const existingBookmarks = data.bookmarks || [];
        const updatedBookmarks = [...existingBookmarks, ...bookmarks];
  
        chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
          alert(`Added ${tabs.length} tabs to bookmarks successfully!`);
        });
      });
    });
  });
  
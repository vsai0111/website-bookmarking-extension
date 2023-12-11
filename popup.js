// popup.js
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('goToSiteButton').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.yourwebsite.com' }); // Replace with your website URL
  });

  document.getElementById('addCurrentButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const currentWebsite = { url: currentTab.url, title: currentTab.title };

      chrome.storage.sync.get('bookmarks', (data) => {
        const existingBookmarks = data.bookmarks || [];
        const updatedBookmarks = [...existingBookmarks, currentWebsite];

        chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
          alert(`Added current website to bookmarks successfully!`);
        });
      });
    });
  });

  document.getElementById('addAllTabsButton').addEventListener('click', () => {
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
});

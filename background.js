// Function to add or update bookmark data in the shared storage
const updateSharedStorage = (bookmarks) => {
  chrome.storage.sync.set({ bookmarks: bookmarks }, () => {
    console.log('Bookmark data updated in shared storage:', bookmarks);
  });
};

// Function to retrieve bookmark data from shared storage
const retrieveBookmarksFromStorage = (callback) => {
  chrome.storage.sync.get('bookmarks', (data) => {
    const bookmarks = data.bookmarks || [];
    callback(bookmarks);
  });
};

// Function to handle bookmark addition or update
const addOrUpdateBookmark = (newBookmark) => {
  retrieveBookmarksFromStorage((existingBookmarks) => {
    const updatedBookmarks = [...existingBookmarks.filter(b => b.url !== newBookmark.url), newBookmark];
    updateSharedStorage(updatedBookmarks);
  });
};

// Function to handle tab management and data synchronization
const manageTabsAndSyncData = async () => {
  const tabs = await chrome.tabs.query({}).catch(error => {
    console.error('Error querying tabs:', error);
  });
  if (!tabs || tabs.length === 0) {
    console.error('No tabs found.');
    return;
  }
  const tabData = tabs.map(tab => ({ title: tab.title, url: tab.url }));
  updateSharedStorage(tabData);
};

// Content script to interact with website's elements and send messages to web app
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'addOrUpdateBookmark') {
    addOrUpdateBookmark(message.bookmark);
  } else if (message.action === 'manageTabsAndSyncData') {
    manageTabsAndSyncData();
  }
});

// Existing background script code...

document.addEventListener('DOMContentLoaded', async () => {
  // Function to send data to the linked website
  const sendDataToWebsite = (data) => {
    window.postMessage({ type: 'FROM_EXTENSION', data: data }, '*');
  };

  // Function to display bookmarks on the popup
  const displayBookmarks = (bookmarks) => {
    // Do not display bookmarks in the popup, send them to the website instead
    sendDataToWebsite(bookmarks); // Notify website about bookmarks
  };

  // Function to delete bookmark
  const deleteBookmark = (bookmark) => {
    chrome.storage.sync.get('bookmarks', (data) => {
      const bookmarks = data.bookmarks || [];
      const updatedBookmarks = bookmarks.filter(b => b.url !== bookmark.url);
      chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
        sendDataToWebsite(updatedBookmarks); // Notify website about changes
        alert(`Bookmark "${bookmark.title}" deleted successfully!`);
      });
    });
  };

  // Function to add current tab as bookmark
  const addCurrentBookmark = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        console.error('No active tab found.');
        return;
      }
      const newBookmark = { title: tab.title, url: tab.url };
      chrome.storage.sync.get('bookmarks', (data) => {
        const bookmarks = data.bookmarks || [];
        const updatedBookmarks = [...bookmarks, newBookmark];
        chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
          sendDataToWebsite(updatedBookmarks); // Notify website about changes
          alert(`Current tab "${tab.title}" added as bookmark successfully!`);
        });
      });
    } catch (error) {
      console.error('Error adding current tab as bookmark:', error);
    }
  };

  // Function to add all tabs as bookmarks
  const addAllTabsAsBookmarks = async () => {
    try {
      const tabs = await chrome.tabs.query({});
      if (!tabs || tabs.length === 0) {
        console.error('No tabs found.');
        return;
      }
      const newBookmarks = tabs.map(tab => ({ title: tab.title, url: tab.url }));
      chrome.storage.sync.get('bookmarks', (data) => {
        const bookmarks = data.bookmarks || [];
        const updatedBookmarks = [...bookmarks, ...newBookmarks];
        chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
          sendDataToWebsite(updatedBookmarks); // Notify website about changes
          alert(`Added ${tabs.length} tabs to bookmarks successfully!`);
        });
      });
    } catch (error) {
      console.error('Error adding all tabs as bookmarks:', error);
    }
  };

  // Event listeners for button clicks
  document.getElementById('goToSiteButton').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://vsai0111.github.io/Bookmarking-website/' }); // Replace with your website URL
  });

  document.getElementById('addCurrentButton').addEventListener('click', addCurrentBookmark);

  document.getElementById('addAllTabsButton').addEventListener('click', addAllTabsAsBookmarks);

  // Load and display bookmarks on popup open
  chrome.storage.sync.get('bookmarks', (data) => {
    const bookmarks = data.bookmarks || [];
    displayBookmarks(bookmarks);
  });

  // Listen for messages from the website
  window.addEventListener('message', (event) => {
    if (event.source === window && event.data.type === 'FROM_WEBSITE') {
      const receivedData = event.data.data;
      if (Array.isArray(receivedData)) {
        // Update local storage with the received data
        chrome.storage.sync.set({ bookmarks: receivedData });
      }
    }
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  // Function to send data to the linked website
  const sendDataToWebsite = (data) => {
    window.postMessage({ type: 'FROM_EXTENSION', data: data }, '*');
  };

  // Function to display bookmarks on the popup
  const displayBookmarks = (bookmarks) => {
    const bookmarksList = document.getElementById('bookmarks-list');
    if (!bookmarksList) {
      console.error('Bookmarks list element not found.');
      return;
    }
    bookmarksList.innerHTML = ''; // Clear previous bookmarks
    bookmarks.forEach(bookmark => {
      const bookmarkElement = createBookmarkElement(bookmark);
      bookmarksList.appendChild(bookmarkElement);
    });
  };

  // Function to create bookmark element
  const createBookmarkElement = (bookmark) => {
    const bookmarkElement = document.createElement('div');
    bookmarkElement.classList.add('bookmark');
    bookmarkElement.innerHTML = `
      <h3>${bookmark.title}</h3>
      <p><a href="${bookmark.url}" target="_blank">${bookmark.url}</a></p>
      <div class="actions">
        <button class="delete-button">Delete</button>
      </div>
    `;
    bookmarkElement.querySelector('.delete-button').addEventListener('click', () => deleteBookmark(bookmark));
    return bookmarkElement;
  };

  // Function to delete bookmark
  const deleteBookmark = (bookmark) => {
    chrome.storage.sync.get('bookmarks', (data) => {
      const bookmarks = data.bookmarks || [];
      const updatedBookmarks = bookmarks.filter(b => b.url !== bookmark.url);
      chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
        displayBookmarks(updatedBookmarks);
        sendDataToWebsite(updatedBookmarks); // Notify website about changes
        alert(`Bookmark "${bookmark.title}" deleted successfully!`);
      });
    });
  };

  // Function to add current tab as bookmark
  const addCurrentBookmark = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true }).catch(error => {
      console.error('Error querying tabs:', error);
    });
    if (!tabs || tabs.length === 0) {
      console.error('No active tab found.');
      return;
    }
    const tab = tabs[0];
    const newBookmark = { title: tab.title, url: tab.url };
    chrome.storage.sync.get('bookmarks', (data) => {
      const bookmarks = data.bookmarks || [];
      const updatedBookmarks = [...bookmarks, newBookmark];
      chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
        displayBookmarks(updatedBookmarks);
        sendDataToWebsite(updatedBookmarks); // Notify website about changes
        alert(`Current tab "${tab.title}" added as bookmark successfully!`);
      });
    });
  };

  // Function to add all tabs as bookmarks
  const addAllTabsAsBookmarks = async () => {
    const tabs = await chrome.tabs.query({}).catch(error => {
      console.error('Error querying tabs:', error);
    });
    if (!tabs || tabs.length === 0) {
      console.error('No tabs found.');
      return;
    }
    const newBookmarks = tabs.map(tab => ({ title: tab.title, url: tab.url }));
    chrome.storage.sync.get('bookmarks', (data) => {
      const bookmarks = data.bookmarks || [];
      const updatedBookmarks = [...bookmarks, ...newBookmarks];
      chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
        displayBookmarks(updatedBookmarks);
        sendDataToWebsite(updatedBookmarks); // Notify website about changes
        alert(`Added ${tabs.length} tabs to bookmarks successfully!`);
      });
    });
  };

  // Event listeners for button clicks
  document.getElementById('goToSiteButton').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.yourwebsite.com' }); // Replace with your website URL
  });

  document.getElementById('addCurrentButton').addEventListener('click', addCurrentBookmark);

  document.getElementById('addAllTabsButton').addEventListener('click', addAllTabsAsBookmarks);

  // Load and display bookmarks on popup open
  chrome.storage.sync.get('bookmarks', (data) => {
    const bookmarks = data.bookmarks || [];
    displayBookmarks(bookmarks);
    sendDataToWebsite(bookmarks); // Notify website about existing bookmarks
  });

  // Listen for messages from the website
  window.addEventListener('message', (event) => {
    if (event.source === window && event.data.type === 'FROM_WEBSITE') {
      const receivedData = event.data.data;
      if (Array.isArray(receivedData)) {
        // Update local storage with the received data
        chrome.storage.sync.set({ bookmarks: receivedData }, () => {
          // Refresh the display with the updated data
          displayBookmarks(receivedData);
        });
      }
    }
  });
});

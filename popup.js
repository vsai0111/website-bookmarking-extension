document.addEventListener('DOMContentLoaded', function () {
  // Function to send data to the linked website
  const sendDataToWebsite = (data) => {
    window.postMessage({ type: 'FROM_EXTENSION', data: data }, '*');
  };

  // Function to display bookmarks on the popup
  const displayBookmarks = (bookmarks) => {
    // Modify this function based on your existing popup UI
    // For example, update a list of bookmarks in the popup
    console.log('Displaying bookmarks in the popup:', bookmarks);
  };

  // Function to add a bookmark and notify the website
  const addBookmarkAndNotify = (newBookmark) => {
    chrome.storage.sync.get('bookmarks', (data) => {
      const existingBookmarks = data.bookmarks || [];
      const updatedBookmarks = [...existingBookmarks, newBookmark];

      chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
        alert(`Added bookmark "${newBookmark.title}" to your collection!`);
        sendDataToWebsite(updatedBookmarks); // Notify the website about the changes
      });
    });
  };

  // Existing code to get and display bookmarks in the popup
  chrome.storage.sync.get('bookmarks', (data) => {
    const bookmarks = data.bookmarks || [];
    displayBookmarks(bookmarks);
    sendDataToWebsite(bookmarks); // Notify the website about existing bookmarks
  });

  // Existing code for adding a bookmark in the popup
  document.getElementById('addBookmarkButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const newBookmark = { title: currentTab.title, url: currentTab.url };
      addBookmarkAndNotify(newBookmark); // Call the modified function to add and notify
    });
  });

  // Other existing code...

  // Listen for messages from the website
  window.addEventListener('message', function (event) {
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

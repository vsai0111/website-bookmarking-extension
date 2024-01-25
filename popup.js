document.addEventListener('DOMContentLoaded', async function () {
  // Function to send data to the linked website
  const sendDataToWebsite = (data) => {
    window.postMessage({ type: 'FROM_EXTENSION', data: data }, '*');
  };

  // Function to display bookmarks on the popup
  const displayBookmarks = async () => {
    try {
      const { bookmarks } = await chrome.storage.sync.get('bookmarks');
      const bookmarksList = document.getElementById('bookmarks-list');
      bookmarksList.innerHTML = ''; // Clear previous bookmarks
      bookmarks.forEach(bookmark => {
        const bookmarkElement = createBookmarkElement(bookmark);
        bookmarksList.appendChild(bookmarkElement);
      });
    } catch (error) {
      console.error('Error displaying bookmarks:', error);
    }
  };

  // Function to create a bookmark element
  const createBookmarkElement = (bookmark) => {
    const bookmarkElement = document.createElement('div');
    bookmarkElement.classList.add('bookmark');
    bookmarkElement.innerHTML = `
      <h3>${bookmark.title}</h3>
      <p><a href="${bookmark.url}" target="_blank">${bookmark.url}</a></p>
      <div class="actions">
        <button onclick="deleteBookmark('${bookmark.title}')">Delete</button>
      </div>
    `;
    return bookmarkElement;
  };

  // Function to delete a bookmark
  const deleteBookmark = async (title) => {
    try {
      const { bookmarks } = await chrome.storage.sync.get('bookmarks');
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark.title !== title);
      await chrome.storage.sync.set({ bookmarks: updatedBookmarks });
      await displayBookmarks(); // Refresh the display after deletion
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  // Function to handle "Go to Site" button click
  const goToSite = () => {
    chrome.tabs.create({ url: 'https://www.yourwebsite.com' }); // Replace with your website URL
  };

  // Function to handle "Add Bookmark" button click
  const addBookmark = async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      const newBookmark = { title: currentTab.title, url: currentTab.url };
      const { bookmarks } = await chrome.storage.sync.get('bookmarks');
      const updatedBookmarks = [...bookmarks, newBookmark];
      await chrome.storage.sync.set({ bookmarks: updatedBookmarks });
      await displayBookmarks(); // Refresh the display after adding a new bookmark
      alert(`Added bookmark "${newBookmark.title}" to your collection!`);
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  // Attach event listeners
  document.getElementById('goToSiteButton').addEventListener('click', goToSite);
  document.getElementById('addBookmarkButton').addEventListener('click', addBookmark);

  // Display bookmarks when the popup is loaded
  await displayBookmarks();
});

if (!window.localStorage.getItem('installedAt')) {
  chrome.tabs.create({ url: 'index.html' })
  window.localStorage.setItem('installedAt', new Date())
}

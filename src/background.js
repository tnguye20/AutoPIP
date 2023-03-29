const AUTOPIP_STORAGE_TABID = "autoPip_tabID";

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabs = await chrome.tabs.query({
    audible: true,
  });

  console.log(tabs);

  // Will only work for 1 audible tab
  if (tabs.length === 1) {
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "pip",
        isPIP: true,
        tabId: tab.id,
        active: tab.active,
      },
      (response) => {
        if (chrome.runtime.lastError !== undefined) {
          console.log("[background.js] " + chrome.runtime.lastError.message);
        }
        console.log("[background.ts]", response);
      }
    );
  } else if (tabs.length === 0) {
    console.log("[background.ts] No audible tab. Clear Cache.");
    // chrome.storage.local.remove(AUTOPIP_STORAGE_TABID);
  }
});

var console = {};
console.log = function () {};
const AUTOPIP_STORAGE_TABID = "autoPip_tabID";

const logger = (l) => {
  console.log("[AUTOPIP BACKGROUND] ", l);
};

const backgroundMessageCallback = (response) => {
  if (chrome.runtime.lastError !== undefined) {
    logger(chrome.runtime.lastError.message);
  }
  logger(response);
};

const getTabByIdCallback = async (tab) => {
  if (chrome.runtime.lastError !== undefined) {
    logger(chrome.runtime.lastError.message);
    await chrome.storage.local.remove(AUTOPIP_STORAGE_TABID);
    logger(`tabId is no longer valid. Clearing.`);
  } else {
    logger(`Found ${tab.id}`);
  }
};

const sendMessageToTab = (tabId, msg, fn = backgroundMessageCallback) => {
  chrome.tabs.sendMessage(tabId, msg, fn);
};

const getAudibleTabs = async () => {
  return await chrome.tabs.query({
    audible: true,
  });
};

const onActivatedListener = async (activeInfo) => {
  const cache = (await chrome.storage.local.get([AUTOPIP_STORAGE_TABID])) || {};
  logger(cache);

  if (AUTOPIP_STORAGE_TABID in cache) {
    chrome.tabs.get(cache[AUTOPIP_STORAGE_TABID], getTabByIdCallback);
  }

  const tabs = await getAudibleTabs();

  if (tabs.length >= 1) {
    const tab = tabs[0];
    const msg = {
      type: "ENTER_PIP",
      tabId: tab.id,
      active: tab.active,
    };
    sendMessageToTab(tab.id, msg);
  } else {
    if (AUTOPIP_STORAGE_TABID in cache) {
      const cachedTabId = cache[AUTOPIP_STORAGE_TABID];
      if (cachedTabId === activeInfo.tabId) {
        const msg = {
          type: "EXIT_PIP",
          tabId: activeInfo.id,
        };
        sendMessageToTab(cachedTabId, msg);
      }
    }
  }
};

const onCommandListener = async (command) => {
  logger(`Command: ${command}`);
  try {
    const tabs = await getAudibleTabs();
    const cache =
      (await chrome.storage.local.get([AUTOPIP_STORAGE_TABID])) || {};
    if (tabs.length != 1 && !(AUTOPIP_STORAGE_TABID in cache)) {
      throw new Error("None or too many audible tabs to focus.");
    }
    const tab = tabs[0];

    switch (command) {
      case "to_audio_tab": {
        chrome.tabs.update(tab.id, { active: true });
        break;
      }
      case "mute_pip": {
        const muted = !tab.mutedInfo.muted;
        chrome.tabs.update(tab.id, { muted });
        break;
      }
      case "exit_pip": {
        const msg = {
          type: "EXIT_PIP",
          tabId: tab.id,
        };
        sendMessageToTab(tab.id, msg);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    logger(err);
  }
};

chrome.tabs.onActivated.addListener(onActivatedListener);
chrome.commands.onCommand.addListener(onCommandListener);

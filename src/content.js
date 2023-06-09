var console = {};
console.log = function () {};
const AUTOPIP_STORAGE_TABID = "autoPip_tabID";

const logger = (l) => {
  console.log("[AUTOPIP CONTENT] ", l);
};

if (document.pictureInPictureEnabled) {
  chrome.runtime.onMessage.addListener(async (request, _, sendResponse) => {
    let msg =
      "[content.js] AutoPIP message recieved in tab. Type: " +
      request.type +
      "\n";
    logger(msg);
    try {
      let videos = document.querySelectorAll("video");
      videos = Array.from(videos).filter((video) => video.paused === false);
      const video = videos.length >= 1 ? videos[0] : null;
      if (video === null) {
      }

      switch (request.type) {
        case "PLAYPAUSE_PIP": {
          document.pictureInPictureElement.click();
        }
        case "ENTER_PIP": {
          const video = videos[0];

          video.addEventListener("leavepictureinpicture", async () => {
            await chrome.storage.local.remove(AUTOPIP_STORAGE_TABID);
          });

          if (request.active && video === document.pictureInPictureElement) {
            await document.exitPictureInPicture();
            await chrome.storage.local.remove(AUTOPIP_STORAGE_TABID);
            msg += "Requested exit PIP in " + request.tabId;
          } else {
            await video.requestPictureInPicture();
            await chrome.storage.local.set({
              [AUTOPIP_STORAGE_TABID]: request.tabId,
            });
            msg += "Requested PIP in " + request.tabId;
          }
          break;
        }
        case "EXIT_PIP": {
          await document.exitPictureInPicture();
          await chrome.storage.local.remove(AUTOPIP_STORAGE_TABID);
          msg += "Requested exit PIP in " + request.tabId;
          break;
        }
        default:
          break;
      }
    } catch (err) {
      logger(err);
      sendResponse({ msg });
    } finally {
      sendResponse({ msg });
    }
  });
} else {
  alert(
    "Picture-In-Picture is not enabled for this browser. Please enable it and reinstall the extension"
  );
}

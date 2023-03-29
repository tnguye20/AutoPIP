const AUTOPIP_STORAGE_TABID = "autoPip_tabID";
const AUTOPIP_DUMMY_EL_ID = "autoPip_dummy_id";

if (document.pictureInPictureEnabled) {
  const isVideoPlaying = () => {
    const video = document.querySelector("video");
    if (video === null) {
      return false;
    }
    return !video.paused;
  };

  chrome.runtime.onMessage.addListener(async (request, _, sendResponse) => {
    let msg = "[content.js] AutoPIP message recieved in tab ";

    if (isVideoPlaying) {
      const video = document.querySelector("video");
      if (request.active && video === document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    }
    sendResponse({ msg });
  });
} else {
  alert(
    "Picture-In-Picture is not enabled for this browser. Please enable it and reinstall the extension"
  );
}

// 事件绑定
document.getElementById('wechatVideo').addEventListener('click', function () {
  sendMessage({ isTrust: true, type: 'wechatVideo' });
});
document.getElementById('wechatAudio').addEventListener('click', function () {
  sendMessage({ isTrust: true, type: 'wechatAudio' });
});
document.getElementById('wechatImage').addEventListener('click', function () {
  sendMessage({ isTrust: true, type: 'wechatImage' });
});

function sendMessage(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

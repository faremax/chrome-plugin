const faremax_wx_download = (function () {
  function f_initPannel() {
    const pannel = document.createElement('div');
    const table = document.createElement('table');
    const close = document.createElement('div')

    pannel.className = 'fd-pannel hidden';
    table.className = 'fd-pannel-table';
    close.className = 'fd-pannel-close';

    close.innerHTML = '&times;';
    table.innerHTML = '<tr><th>资源名称</th><th>下载进度</th></tr>';
    pannel.innerHTML = '<h1 class="fd-pannel-title">Fare-Download</h1>';

    pannel.appendChild(close);
    pannel.appendChild(table);
    document.body.appendChild(pannel);

    close.addEventListener('click', () => {
      pannel.className = pannel.className + ' hidden';
    });

    return {
      pannel,
      table
    }
  }

  function f_randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHIJKMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  }

  function f_showPannel() {
    pannel.className = pannel.className.replace(/hidden/g, '').trim();
  }

  function f_addTaskToPannel(taskName, url) {
    const tr = document.createElement('tr');
    const progress = document.createElement('td');
    tr.innerHTML = `<td><a href="${url}" target="_blank">${taskName}</a></td>`;
    tr.appendChild(progress);
    table.firstElementChild.appendChild(tr);
    return progress;
  }

  function f_wechatImage() {
    const imgs = document.querySelectorAll('img');
    for (var i = 0, len = imgs.length; i < len; i++) {
      const src = imgs[i].getAttribute('data-src');
      const mime = f_getPictureMime(src);
      src && f_downloadFile(src, mime);
    }
  }

  function f_wechatVideo() {
    let src;
    var frameWarp = document.querySelectorAll('.js_tx_video_container');
    document.domain = 'qq.com';
    for (var i = 0; i < frameWarp.length; i++) {
      var dom = frameWarp[i].querySelector('iframe').contentDocument;
      var videos = dom.getElementsByTagName('video');
      for (var j = 0; j < videos.length; j++) {
        src = videos[j].getAttribute('src') || '';
        src && f_downloadFile(src, 'video/mp4');
      }
    }
  }

  function f_wechatAudio() {
    const { host } = location;
    var audios = document.getElementsByTagName('audio');
    for (var i = 0, len = audios.length; i < len; i++) {
      var src = audios[i].getAttribute('src') || '';
      f_downloadFile(src);
    }
  }

  function f_getPictureMime(url) {
    if (url) {
      const type = f_getQueryFromURL(url).wx_fmt || 'gif';
      return `image/${type}`;
    }
  }


  function f_getFileNameFromURL(url, mime) {
    const path = url.split(/\?|#/)[0];
    const match = path.split('/');
    const suffix = '.' + mime.split('/')[1] || '';
    const fileName = match[match.length - 1] || "anonymous_file";
    const reg = new RegExp(suffix + '$');
    return reg.test(fileName) ? fileName : fileName + suffix;
  }

  function f_downloadFile(url, mime) {
    if (!url) return;
    const fileName = f_getFileNameFromURL(url, mime) + f_randomString(8);
    const progress = f_addTaskToPannel(fileName, url);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", f_toHTTPS(url), true);
    xhr.responseType = "blob";
    xhr.onload = e => {
      download(e.target.response, fileName, mime);
    };
    xhr.onprogress = e => {
      if (e.total) {
        progress.innerText = (e.loaded / e.total * 100).toFixed(2) + '%';
      } else {
        progress.innerText = 'Downloading...';
      }
    };
    xhr.ontimeout = () => {
      progress.innerText = 'Timeout!';
    };
    xhr.onloadend = e => {
      !e.total && (progress.innerText = '100%');
    };
    xhr.send();
  }

  function f_getQueryFromURL(url) {
    const result = {};
    const search = url.split('#')[0].split('?')[1] || '';
    const kv = search.split('&');
    kv.forEach(it => {
      const [key, value] = it.split('=');
      key && (result[key] = window.decodeURIComponent(value));
    });
    return result;
  }

  function f_toHTTPS(url) {
    if (/^https:/.test(url)) {
      return url;
    } else {
      return url.replace(/^http:/, 'https:');
    }
  }

  const { pannel, table } = f_initPannel();

  return {
    wechatImage: f_wechatImage,
    wechatAudio: f_wechatAudio,
    wechatVideo: f_wechatVideo,
    showPannel: f_showPannel,
    pannel,
    table
  }
})();


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  request = request || {};
  let type = request.type;
  let acFun = null;
  if (window.getComputedStyle(faremax_wx_download.pannel).display === 'none') {
    faremax_wx_download.showPannel();
  }
  switch (type) {
    case "wechatVideo": acFun = faremax_wx_download.wechatVideo; break;
    case "wechatImage": acFun = faremax_wx_download.wechatImage; break;
    case "wechatAudio": acFun = faremax_wx_download.wechatAudio; break;
    default: acFun = () => { }; break;
  }
  acFun();
});

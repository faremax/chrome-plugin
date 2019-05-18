(function () {
  function toBlank(id) {
    [].forEach.call(document.getElementById(id).getElementsByTagName('a'), function (item) {
      item.setAttribute('target', '_blank');
    });
  }

  if (/google.com\/search/.test(window.location.href)) {
    toBlank('search');
    toBlank('rhs');
  }
})();

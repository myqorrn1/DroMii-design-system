(function () {
  var root = document.body;
  var stored = localStorage.getItem('dm-doc-product');
  var initial = stored === 'd-road' ? stored : (root.dataset.product || 'k-aquas');

  function setProduct(product) {
    root.dataset.product = product;
    localStorage.setItem('dm-doc-product', product);
    document.querySelectorAll('[data-theme]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.theme === product));
    });
  }

  document.addEventListener('click', function (event) {
    var themeButton = event.target.closest('[data-theme]');
    if (themeButton) setProduct(themeButton.dataset.theme);

    var tab = event.target.closest('[role="tab"]');
    if (tab && !tab.disabled) {
      var list = tab.closest('[role="tablist"]');
      list.querySelectorAll('[role="tab"]').forEach(function (item) {
        item.setAttribute('aria-selected', String(item === tab));
        item.tabIndex = item === tab ? 0 : -1;
      });
      var panelId = tab.getAttribute('aria-controls');
      if (panelId) {
        document.querySelectorAll('[role="tabpanel"]').forEach(function (panel) {
          panel.hidden = panel.id !== panelId;
        });
      }
    }
  });

  document.addEventListener('keydown', function (event) {
    var tab = event.target.closest('[role="tab"]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    var tabs = Array.from(tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]:not(:disabled)'));
    var index = tabs.indexOf(tab);
    var next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
      (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  });

  setProduct(initial);
})();

// Links that still hold a PLACEHOLDER, and buttons marked data-soon, show a short note instead of going anywhere.
(function () {
  var toast;
  var timer;

  function say(text) {
    if (!toast) {
      toast = document.createElement('p');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(function () { toast.hidden = true; }, 3200);
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('a[href*="PLACEHOLDER"], [data-soon]');
    if (!el) return;
    e.preventDefault();
    say(el.getAttribute('data-soon') || 'Draft: this link is not connected yet.');
  });
})();

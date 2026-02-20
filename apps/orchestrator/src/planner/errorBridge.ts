export function getErrorBridgeScript(): string {
  return `(function() {
  var errors = [];
  var reported = false;
  var MAX_ERRORS = 20;
  var REPORT_DELAY = 3000;
  var FALLBACK_TIMEOUT = 15000;

  function pushError(source, message, extra) {
    if (errors.length >= MAX_ERRORS) return;
    errors.push({
      source: source,
      message: String(message).slice(0, 1000),
      extra: extra || null,
      timestamp: Date.now()
    });
  }

  // 1. Synchronous JS errors
  window.onerror = function(message, source, lineno, colno, error) {
    pushError('onerror', message, {
      file: source,
      line: lineno,
      col: colno,
      stack: error && error.stack ? error.stack.slice(0, 500) : null
    });
  };

  // 2. Unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    var msg = event.reason
      ? (event.reason.message || String(event.reason))
      : 'Unhandled Promise rejection';
    pushError('unhandledrejection', msg, {
      stack: event.reason && event.reason.stack
        ? event.reason.stack.slice(0, 500)
        : null
    });
  });

  // 3. console.error interception (filtered)
  var origConsoleError = console.error;
  console.error = function() {
    var args = Array.prototype.slice.call(arguments);
    var msg = args.map(function(a) {
      return typeof a === 'string' ? a : JSON.stringify(a);
    }).join(' ');

    var noise = [
      'Download the React DevTools',
      'Warning:',
      'ReactDOM.render is no longer supported',
      '[HMR]',
      '[Fast Refresh]',
      'webpack',
      'The above error occurred',
      'Consider adding an error boundary'
    ];
    var isNoise = noise.some(function(n) { return msg.indexOf(n) !== -1; });
    if (!isNoise && msg.length > 0) {
      pushError('console.error', msg);
    }

    origConsoleError.apply(console, arguments);
  };

  // 4. Check for Next.js error overlay in DOM
  function checkErrorOverlay() {
    try {
      var overlay = document.querySelector('nextjs-portal');
      if (overlay && overlay.shadowRoot) {
        var dialog = overlay.shadowRoot.querySelector('[role="dialog"]');
        if (dialog) {
          var text = (dialog.textContent || '').trim();
          if (text.length > 0) {
            pushError('nextjs-overlay', text.slice(0, 500));
          }
        }
      }
    } catch (e) {}
  }

  // 5. Send report to parent via postMessage
  function sendReport() {
    if (reported) return;
    reported = true;

    checkErrorOverlay();

    var report = {
      type: '__ERROR_BRIDGE_REPORT__',
      errors: errors,
      url: window.location.href,
      timestamp: Date.now()
    };

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(report, '*');
    }
  }

  // Wait for page load + delay for async rendering/hydration
  if (document.readyState === 'complete') {
    setTimeout(sendReport, REPORT_DELAY);
  } else {
    window.addEventListener('load', function() {
      setTimeout(sendReport, REPORT_DELAY);
    });
  }

  // Fallback: report even if load never fires
  setTimeout(function() {
    if (!reported) sendReport();
  }, FALLBACK_TIMEOUT);
})();`;
}

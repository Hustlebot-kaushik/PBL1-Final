// frictionTracker.js
window.createFrictionTracker = function createFrictionTracker({
  apiUrl, // e.g. "http://127.0.0.1:5000/api/track"
  sessionId,
  userId = "guest",
  onPrediction = () => {}, // callback(response)
}) {
  const deviceType = getDeviceType();
  const browser = getBrowser();

  function getDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone/.test(ua)) return "mobile";
    if (/ipad|tablet/.test(ua)) return "tablet";
    return "desktop";
  }

  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes("Edg")) return "edge";
    if (ua.includes("Chrome")) return "chrome";
    if (ua.includes("Firefox")) return "firefox";
    if (ua.includes("Safari")) return "safari";
    return "unknown";
  }

  // Generate numeric session id if the string has 'sess_' prefix
  const numericSessionId = parseInt(sessionId.replace(/\D/g, '').slice(0,9) || Date.now().toString().slice(-9)) || Date.now();

  async function emitEvent(eventType, errorFlag = 0, amount = 0) {
    const payload = {
      session_id: numericSessionId,
      user_id: userId,
      event_type: eventType,
      page_name: window.location.pathname + window.location.search,
      device_type: deviceType,
      browser: browser,
      error_flag: errorFlag,
      amount: amount
    };

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        keepalive: true,
        headers: { 
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true" 
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.prediction) {
          onPrediction(data, res.status);
      }
    } catch (err) {
      console.error("Friction tracker api error:", err);
    }
  }

  function onRouteChange() {
      emitEvent("page_view");
  }

  // Public API
  const api = {
    trackClick() {
        emitEvent("click");
    },
    trackBackClick() {
        emitEvent("backtrack");
    },
    trackRetry() {
        emitEvent("retry", 1); 
    },
    trackSearch() {
        emitEvent("search");
    },
    trackCheckout() {
        emitEvent("checkout");
    },
    trackError() {
        emitEvent("error", 1);
    },
    trackPurchase(amount = 0) {
        emitEvent("purchase", 0, amount);
    },
    onRouteChange,
    flushNow: () => {}, 
    getState() {
      return { session_id: numericSessionId };
    },
    destroy() {
    },
  };

  // initial hit
  emitEvent("page_view");

  return api;
}
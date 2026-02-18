// ============================================================
// kore-init.js — Initializes the Kore.ai chatbot (SDK v3)
// ============================================================
// This script runs after kore-config.js has set up the config.
// Uses the new KoreChatSDK v3 API (chatWindow class).
// ============================================================

(function () {
  // Wait for DOM to be ready
  document.addEventListener("DOMContentLoaded", function () {
    try {
      var chatConfig = window._koreChatConfig || KoreChatSDK.chatConfig;
      var chatWindow = KoreChatSDK.chatWindow;

      // --- Dynamically set the logged-in user's name in customData ---
      var loggedInUser = sessionStorage.getItem("user");
      var userName = "User";
      if (loggedInUser) {
        var userData = JSON.parse(loggedInUser);
        userName = userData.fullName || "User";
      }
      // Set customData directly on botInfo
      chatConfig.botOptions.botInfo.customData = { name: userName };
      // Also set customDataFn for dynamic per-message delivery
      chatConfig.botOptions.botInfo.customDataFn = function () {
        return { name: userName };
      };

      // Create chat window instance
      var chatWindowInstance = new chatWindow();

      // Show the chat widget
      chatWindowInstance.show(chatConfig);
    } catch (err) {
      console.error("Kore.ai chatbot initialization error:", err);
    }
  });
})();

// ============================================================
// kore-config.js — Kore.ai Bot Configuration (SDK v3)
// ============================================================
// This file sets up the connection to your Kore.ai virtual assistant.
// It is loaded on every page so the chatbot is always available.
// Updated for Web SDK v3 (11.21.1) — uses KoreChatSDK API.
// ============================================================

(function () {
  // Get references from the SDK
  var chatConfig = KoreChatSDK.chatConfig;
  var botOptions = chatConfig.botOptions;

  // --- Your Kore.ai Bot Credentials ---
  botOptions.JWTUrl = "https://mk2r2rmj21.execute-api.us-east-1.amazonaws.com/dev/users/sts";
  botOptions.userIdentity = "aniljonnalagaddakumar@gmail.com";
  botOptions.botInfo = {
    name: "Automation Advanced Feb 2026",
    _id: "st-759e21a8-fe06-5b93-bf2b-bb1824ed561f",
  };
  botOptions.clientId = "cs-06aae219-211a-56d2-84d0-b89cda1897bd";
  botOptions.clientSecret = "w+ozPfhc3rSXl7prNngNboxVborhITAziOLO5AwO5Sk=";
  botOptions.botInfo.customData = {"name":"John"}

  // --- Chat window configuration ---
  chatConfig.chatTitle = "Kore Banking Assistant";
  chatConfig.minimizeMode = true;      // Start minimized (small chat icon)
  chatConfig.loadHistory = true;       // Load recent chat history
  chatConfig.messageHistoryLimit = 10;

  // Multi-page app support (preserves chat state across login → dashboard)
  chatConfig.multiPageApp = {
    enable: true,
    userIdentityStore: "sessionStorage",
    chatWindowStateStore: "sessionStorage",
  };

  // Expose chatConfig globally for kore-init.js
  window._koreChatConfig = chatConfig;
})();

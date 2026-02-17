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
    name: "Advance Training Jan 2026",
    _id: "st-40988f63-3e63-5b7d-82bb-4994f6cacabf",
  };
  botOptions.clientId = "cs-654936d7-932b-59ae-8b0d-6a65244f796f";
  botOptions.clientSecret = "oBQv6jdUkmr8uQk08dvsNBK2v8/R3zEP8RXpVZAzzrQ=";

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

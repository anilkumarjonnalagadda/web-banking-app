// ============================================================
// kore-config.js — Kore.ai Bot Configuration for the Banking App
// ============================================================
// This file sets up the connection to your Kore.ai virtual assistant.
// It is loaded on every page so the chatbot is always available.
// ============================================================

(function (KoreSDK) {

  var KoreSDK = KoreSDK || {};

  var botOptions = {};
  botOptions.logLevel = "debug";
  botOptions.koreAPIUrl = "https://platform.kore.ai/api/";
  botOptions.koreSpeechAPIUrl = ""; // deprecated
  botOptions.koreAnonymousFn = koreAnonymousFn;
  botOptions.recorderWorkerPath = "kore-sdk/libs/recorderWorker.js";

  // Acknowledgment settings
  botOptions.enableAck = {
    delivery: false,
  };

  // WebSocket config
  botOptions.webSocketConfig = {
    socketUrl: {
      queryParams: {},
    },
  };

  // --- Your Kore.ai Bot Credentials ---
  // (These come from the Kore.ai platform for your bot)
  botOptions.JWTUrl = "https://mk2r2rmj21.execute-api.us-east-1.amazonaws.com/dev/users/sts";
  botOptions.userIdentity = "aniljonnalagaddakumar@gmail.com";
  botOptions.botInfo = {
    name: "Advance Training Jan 2026",
    _id: "st-40988f63-3e63-5b7d-82bb-4994f6cacabf",
  };

  botOptions.clientId = "cs-654936d7-932b-59ae-8b0d-6a65244f796f";
  botOptions.clientSecret = "oBQv6jdUkmr8uQk08dvsNBK2v8/R3zEP8RXpVZAzzrQ=";

  // Branding / theming
  botOptions.brandingAPIUrl =
    botOptions.koreAPIUrl + "websdkthemes/" + botOptions.botInfo._id + "/activetheme";
  botOptions.enableThemes = true;

  // --- Chat window configuration ---
  var chatConfig = {
    botOptions: botOptions,
    allowIframe: false,
    isSendButton: false,
    isTTSEnabled: false,       // Disabled TTS for simplicity in banking app
    isSpeechEnabled: false,    // Disabled speech for simplicity in banking app
    allowLocation: false,      // No location needed for banking
    loadHistory: true,         // Load recent chat history
    messageHistoryLimit: 10,
    graphLib: "d3",
    minimizeMode: true,        // Start minimized (small chat icon in corner)
    // IMPORTANT: Enable multi-page mode since we have login + dashboard pages
    multiPageApp: {
      enable: true,
      userIdentityStore: "sessionStorage",
      chatWindowStateStore: "sessionStorage",
    },
    supportDelayedMessages: true,
    maxTypingIndicatorTime: 10000,
    pickersConfig: {
      showDatePickerIcon: false,
      showDateRangePickerIcon: false,
      showClockPickerIcon: false,
      showTaskMenuPickerIcon: false,
      showradioOptionMenuPickerIcon: false,
    },
    sendFailedMessage: {
      MAX_RETRIES: 3,
    },
    maxReconnectionAPIAttempts: 5,
    syncMessages: {
      onReconnect: {
        enable: false,
        batchSize: 10,
      },
      onNetworkResume: {
        enable: true,
        batchSize: 10,
      },
    },
    showAttachment: true,
  };

  KoreSDK.chatConfig = chatConfig;
})(window.KoreSDK);

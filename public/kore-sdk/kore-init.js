// ============================================================
// kore-init.js — Initializes the Kore.ai chatbot on every page
// ============================================================
// This script runs after kore-config.js has set up the config.
// It handles JWT authentication and opens the chat widget.
// ============================================================

(function ($) {
  $(document).ready(function () {

    // --- JWT Authentication ---
    // This function is called by the SDK to get a JWT token
    // so the bot knows who the user is.
    function assertion(options, callback) {
      var jsonData = {
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        identity: options.userIdentity,
        aud: "",
        isAnonymous: false,
      };
      $.ajax({
        url: options.JWTUrl,
        type: "post",
        data: jsonData,
        dataType: "json",
        success: function (data) {
          options.assertion = data.jwt;
          options.handleError = koreBot.showError;
          options.chatHistory = koreBot.chatHistory;
          options.botDetails = koreBot.botDetails;
          callback(null, options);
          setTimeout(function () {
            if (koreBot && koreBot.initToken) {
              koreBot.initToken(options);
            }
          }, 2000);
        },
        error: function (err) {
          koreBot.showError(err.responseText);
        },
      });
    }

    // --- Branding / Theming ---
    // Loads the bot's visual theme from the Kore.ai platform
    function getBrandingInformation(options) {
      if (chatConfig.botOptions && chatConfig.botOptions.enableThemes) {
        var brandingAPIUrl = (chatConfig.botOptions.brandingAPIUrl || "").replace(
          ":appId",
          chatConfig.botOptions.botInfo._id
        );
        $.ajax({
          url: brandingAPIUrl,
          headers: {
            Authorization: "bearer " + options.authorization.accessToken,
          },
          type: "get",
          dataType: "json",
          success: function (data) {
            if (koreBot && koreBot.applySDKBranding) {
              koreBot.applySDKBranding(data);
            }
            if (koreBot && koreBot.initToken) {
              koreBot.initToken(options.authorization);
            }
          },
          error: function (err) {
            console.log("Branding load error:", err);
          },
        });
      }
    }

    function onJWTGrantSuccess(options) {
      getBrandingInformation(options);
    }

    // --- Initialize the bot ---
    var chatConfig = window.KoreSDK.chatConfig;
    chatConfig.botOptions.assertionFn = assertion;
    chatConfig.botOptions.jwtgrantSuccessCB = onJWTGrantSuccess;

    var koreBot = koreBotChat();
    koreBot.show(chatConfig);

    // Make the "Open Chat Window" button work (if present)
    $(".openChatWindow").click(function () {
      koreBot.show(chatConfig);
    });
  });
})(jQuery || (window.KoreSDK && window.KoreSDK.dependencies && window.KoreSDK.dependencies.jQuery));

module.exports = {
  expo: {
    name: "ExpoGallery",
    slug: "ExpoGallery",
    version: "0.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "expo-gallery",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.curtcox.ExpoGallery",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSMicrophoneUsageDescription": "This app uses the microphone to record audio."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-speech-recognition",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-sensors",
        {
          "motionPermission": "Allow $(PRODUCT_NAME) to access your device motion"
        }
      ],
      "expo-asset",
      "expo-font",
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true,
      baseUrl: process.env.EXPO_PUBLIC_BASE_URL || "/ExpoGallery"
    },
    extra: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "GOOGLE_MAPS_API_KEY",
      chatApiEndpoint: process.env.CHAT_API_ENDPOINT || "CHAT_API_ENDPOINT",
      defaultChatLocation: process.env.DEFAULT_CHAT_LOCATION || "DEFAULT_CHAT_LOCATION",
      buildDate: new Date().toISOString(),
      gitSha: process.env.GITHUB_SHA || 'development',
      "eas": {
        "projectId": "3e5b317d-5f00-4af1-8c9a-b50a6f6fe2c2"
      }
    }
  }
};
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const VPS_URL = "https://fahrdienstbensiamar.de";
const TOKEN_KEY = "@expo_push_token";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("[Push] Not a real device, skipping");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("[Push] Permission denied");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Taxi Bensiamar",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#F5C518",
      sound: "default",
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "83b86b4a-5cd3-44b3-91df-85161b75db37",
    });
    const token = tokenData.data;
    console.log("[Push] Token:", token);

    const stored = await AsyncStorage.getItem(TOKEN_KEY);
    if (stored !== token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await sendTokenToServer(token);
    }

    return token;
  } catch (err) {
    console.log("[Push] Error getting token:", err);
    return null;
  }
}

async function sendTokenToServer(token: string): Promise<void> {
  try {
    await fetch(`${VPS_URL}/api/expo-push-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "include",
    });
    console.log("[Push] Token sent to server");
  } catch (err) {
    console.log("[Push] Could not send token to server:", err);
  }
}

export function setupNotificationListeners(
  onNotification?: (notification: Notifications.Notification) => void,
  onResponse?: (response: Notifications.NotificationResponse) => void
) {
  const notifSub = Notifications.addNotificationReceivedListener((notification) => {
    console.log("[Push] Notification received:", notification);
    onNotification?.(notification);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("[Push] Notification tapped:", response);
    onResponse?.(response);
  });

  return () => {
    notifSub.remove();
    responseSub.remove();
  };
}

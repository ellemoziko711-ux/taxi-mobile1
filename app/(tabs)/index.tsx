import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { useColors } from "@/hooks/useColors";

const SITE_URL = "https://fahrdienstbensiamar.de";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
          Bitte öffnen Sie die App in Expo Go
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        {canGoBack ? (
          <Pressable
            onPress={() => webRef.current?.goBack()}
            hitSlop={12}
            style={styles.navBtn}
          >
            <Feather name="chevron-left" size={22} color={colors.foreground} />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}

        <View style={styles.titleRow}>
          <Feather name="truck" size={16} color="#F5C518" />
          <Text style={[styles.title, { color: colors.foreground }]}>
            Taxi Bensiamar
          </Text>
        </View>

        <Pressable
          onPress={() => {
            setLoading(true);
            setError(false);
            webRef.current?.reload();
          }}
          hitSlop={12}
          style={styles.navBtn}
        >
          <Feather name="refresh-cw" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={{ flex: 1 }}>
        {error ? (
          <View style={styles.errorBox}>
            <Feather name="wifi-off" size={40} color={colors.mutedForeground} />
            <Text style={[styles.errorTitle, { color: colors.foreground }]}>
              Verbindungsfehler
            </Text>
            <Text style={[styles.errorSub, { color: colors.mutedForeground }]}>
              Server nicht erreichbar
            </Text>
            <Pressable
              style={[styles.retryBtn, { backgroundColor: "#1A1A2E" }]}
              onPress={() => {
                setLoading(true);
                setError(false);
                webRef.current?.reload();
              }}
            >
              <Text style={styles.retryText}>Erneut versuchen</Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            ref={webRef}
            source={{ uri: SITE_URL }}
            style={styles.webview}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
            }}
            allowsBackForwardNavigationGestures
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
            mixedContentMode="always"
          />
        )}

        {loading && !error && (
          <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
            <ActivityIndicator size="large" color="#1A1A2E" />
          </View>
        )}
      </View>

      <View style={{ height: botPad }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  errorBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  errorSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});

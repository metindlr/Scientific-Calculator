import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Display } from "@/components/Display";
import { HistorySheet } from "@/components/HistorySheet";
import { Keypad, type KeypadAction } from "@/components/Keypad";
import { useColors } from "@/hooks/useColors";
import { evaluateExpression } from "@/lib/calculator";
import {
  clearHistory,
  loadHistory,
  loadSettings,
  saveHistory,
  saveSettings,
  type HistoryEntry,
  type Settings,
} from "@/lib/storage";

const OPERATORS = ["+", "-", "*", "/", "^"];

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function CalculatorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [expression, setExpression] = useState<string>("");
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [scientific, setScientific] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const [s, h] = await Promise.all([loadSettings(), loadHistory()]);
      setAngleMode(s.angleMode);
      setScientific(s.scientific);
      setHistory(h);
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const settings: Settings = { angleMode, scientific };
    saveSettings(settings);
  }, [angleMode, scientific, hydrated]);

  const livePreview = useMemo(() => {
    if (!expression) return "";
    const trimmed = expression.trim();
    const lastChar = trimmed.charAt(trimmed.length - 1);
    if (OPERATORS.includes(lastChar) || lastChar === "(" || lastChar === ".") {
      return "";
    }
    const value = evaluateExpression(expression, angleMode);
    if (value === "Error") return "";
    return value;
  }, [expression, angleMode]);

  const haptic = useCallback((style: "light" | "medium" | "warning") => {
    if (Platform.OS === "web") return;
    if (style === "warning") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {},
      );
    } else if (style === "medium") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else {
      Haptics.selectionAsync().catch(() => {});
    }
  }, []);

  const appendToken = useCallback((token: string) => {
    setExpression((prev) => prev + token);
  }, []);

  const handleEquals = useCallback(() => {
    if (!expression.trim()) return;
    const value = evaluateExpression(expression, angleMode);
    if (value === "Error" || value === "") {
      haptic("warning");
      return;
    }
    haptic("medium");
    const entry: HistoryEntry = {
      id: makeId(),
      expression,
      result: value,
      createdAt: Date.now(),
    };
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 100);
      saveHistory(next);
      return next;
    });
    setExpression(value);
  }, [expression, angleMode, haptic]);

  const onAction = useCallback(
    (action: KeypadAction) => {
      switch (action.type) {
        case "digit":
          appendToken(action.value);
          break;
        case "decimal": {
          setExpression((prev) => {
            const tail = prev.split(/[+\-*/^()]/).pop() ?? "";
            if (tail.includes(".")) return prev;
            if (!tail) return prev + "0.";
            return prev + ".";
          });
          break;
        }
        case "operator": {
          setExpression((prev) => {
            if (!prev) {
              if (action.value === "-") return "-";
              return prev;
            }
            const last = prev.charAt(prev.length - 1);
            if (OPERATORS.includes(last)) {
              return prev.slice(0, -1) + action.value;
            }
            return prev + action.value;
          });
          break;
        }
        case "function":
          appendToken(action.value);
          break;
        case "clear":
          setExpression("");
          break;
        case "delete":
          setExpression((prev) => prev.slice(0, -1));
          break;
        case "negate":
          setExpression((prev) => {
            if (!prev) return "-";
            if (prev.startsWith("-(") && prev.endsWith(")"))
              return prev.slice(2, -1);
            return `-(${prev})`;
          });
          break;
        case "percent":
          setExpression((prev) => prev + "/100");
          break;
        case "equals":
          handleEquals();
          break;
        case "constant":
          appendToken(action.value);
          break;
        case "scientific":
          appendToken(action.value);
          break;
        case "factorial":
          appendToken("!");
          break;
        case "toggleAngle":
          haptic("medium");
          setAngleMode((m) => (m === "deg" ? "rad" : "deg"));
          break;
      }
    },
    [appendToken, handleEquals, haptic],
  );

  const onSelectHistory = useCallback((entry: HistoryEntry) => {
    setExpression(entry.result);
    setHistoryOpen(false);
  }, []);

  const onClearHistory = useCallback(() => {
    setHistory([]);
    clearHistory();
  }, []);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad =
    Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  // Adaptive sizing based on screen dimensions to support all Android devices
  // (small phones ~320pt to large phones / foldables ~480pt+).
  const shortest = Math.min(width, height);
  const sizeScale = Math.max(0.8, Math.min(1.25, shortest / 390));

  const expressionFontSize = Math.round(
    Math.max(34, Math.min(64, width * 0.13)),
  );
  const resultFontSize = Math.round(expressionFontSize * 0.42);
  const buttonFontSize = Math.round(20 * sizeScale);
  const sciButtonFontSize = Math.round(15 * sizeScale);
  const headerIconSize = Math.round(38 * sizeScale);
  const isSmall = width < 360;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 4 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            haptic("light");
            setHistoryOpen(true);
          }}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: colors.muted,
              opacity: pressed ? 0.6 : 1,
              width: headerIconSize,
              height: headerIconSize,
              borderRadius: headerIconSize / 2,
            },
          ]}
          hitSlop={8}
        >
          <Feather
            name="clock"
            size={Math.round(headerIconSize * 0.5)}
            color={colors.foreground}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            haptic("light");
            setScientific((s) => !s);
          }}
          style={({ pressed }) => [
            styles.modeToggle,
            {
              backgroundColor: scientific ? colors.primary : colors.muted,
              opacity: pressed ? 0.7 : 1,
              paddingVertical: Math.round(8 * sizeScale),
              paddingHorizontal: Math.round(14 * sizeScale),
            },
          ]}
        >
          <Feather
            name={scientific ? "sliders" : "grid"}
            size={Math.round(14 * sizeScale)}
            color={scientific ? colors.primaryForeground : colors.foreground}
          />
          <Text
            style={[
              styles.modeText,
              {
                color: scientific
                  ? colors.primaryForeground
                  : colors.foreground,
                fontSize: Math.round(13 * sizeScale),
              },
            ]}
          >
            {isSmall ? (scientific ? "Sci" : "Basic") : scientific ? "Scientific" : "Basic"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.displayWrap}>
        <Display
          expression={expression}
          result={livePreview}
          angleMode={angleMode}
          expressionFontSize={expressionFontSize}
          resultFontSize={resultFontSize}
        />
      </View>

      <View
        style={[
          styles.keypadWrap,
          {
            paddingBottom: bottomPad + 8,
            flex: scientific ? 1.2 : 0.85,
          },
        ]}
      >
        <Keypad
          scientific={scientific}
          angleMode={angleMode}
          onAction={onAction}
          buttonFontSize={buttonFontSize}
          sciButtonFontSize={sciButtonFontSize}
        />
      </View>

      <HistorySheet
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        entries={history}
        onSelect={onSelectHistory}
        onClear={onClearHistory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  iconBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  modeToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
  },
  modeText: {
    fontFamily: "Inter_600SemiBold",
  },
  displayWrap: {
    flex: 0.5,
    minHeight: 100,
    justifyContent: "flex-end",
  },
  keypadWrap: {
    paddingTop: 4,
  },
});

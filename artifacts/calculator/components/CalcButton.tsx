import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

export type CalcButtonVariant =
  | "digit"
  | "operator"
  | "function"
  | "equals"
  | "scientific";

export type CalcButtonProps = {
  label: string;
  onPress: () => void;
  variant?: CalcButtonVariant;
  flex?: number;
  small?: boolean;
  fontSize?: number;
  testID?: string;
};

export function CalcButton({
  label,
  onPress,
  variant = "digit",
  flex = 1,
  small = false,
  fontSize,
  testID,
}: CalcButtonProps) {
  const colors = useColors();

  const palette = (() => {
    switch (variant) {
      case "operator":
        return { bg: colors.operator, fg: colors.operatorForeground };
      case "function":
        return { bg: colors.func, fg: colors.funcForeground };
      case "equals":
        return { bg: colors.equals, fg: colors.equalsForeground };
      case "scientific":
        return { bg: colors.sci, fg: colors.sciForeground };
      case "digit":
      default:
        return { bg: colors.digit, fg: colors.digitForeground };
    }
  })();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    onPress();
  };

  const containerStyle = ({
    pressed,
  }: PressableStateCallbackType): StyleProp<ViewStyle> => [
    styles.button,
    {
      backgroundColor: palette.bg,
      opacity: pressed ? 0.65 : 1,
      transform: [{ scale: pressed ? 0.97 : 1 }],
    },
  ];

  const resolvedFontSize = fontSize ?? (small ? 16 : 24);

  const textStyle: StyleProp<TextStyle> = [
    styles.label,
    {
      color: palette.fg,
      fontSize: resolvedFontSize,
      fontFamily: "Inter_500Medium",
    },
  ];

  return (
    <View style={[styles.wrapper, { flex }]}>
      <Pressable
        accessibilityRole="button"
        onPress={handlePress}
        testID={testID}
        style={containerStyle}
      >
        <Text style={textStyle} numberOfLines={1} adjustsFontSizeToFit>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  button: {
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    minHeight: 40,
  },
  label: {
    textAlign: "center",
  },
});

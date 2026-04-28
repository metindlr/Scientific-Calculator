import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { formatDisplay } from "@/lib/calculator";
import { useColors } from "@/hooks/useColors";

export type DisplayProps = {
  expression: string;
  result: string;
  angleMode: "deg" | "rad";
};

export function Display({ expression, result, angleMode }: DisplayProps) {
  const colors = useColors();
  const shownExpression = expression ? formatDisplay(expression) : "0";

  return (
    <View style={styles.container}>
      <View style={styles.modeRow}>
        <Text style={[styles.modeBadge, { color: colors.mutedForeground }]}>
          {angleMode.toUpperCase()}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        <Text
          style={[styles.expression, { color: colors.displayForeground }]}
          numberOfLines={1}
        >
          {shownExpression}
        </Text>
      </ScrollView>
      {result.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text
            style={[styles.result, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            = {result}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  modeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    marginBottom: 8,
  },
  modeBadge: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  scroll: {
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    minWidth: "100%",
  },
  expression: {
    fontSize: 56,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    lineHeight: 64,
  },
  result: {
    fontSize: 24,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 6,
  },
});

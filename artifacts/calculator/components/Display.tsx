import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { formatDisplay } from "@/lib/calculator";
import { useColors } from "@/hooks/useColors";

export type DisplayProps = {
  expression: string;
  result: string;
  angleMode: "deg" | "rad";
  expressionFontSize: number;
  resultFontSize: number;
};

export function Display({
  expression,
  result,
  angleMode,
  expressionFontSize,
  resultFontSize,
}: DisplayProps) {
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
          style={[
            styles.expression,
            {
              color: colors.displayForeground,
              fontSize: expressionFontSize,
              lineHeight: expressionFontSize * 1.15,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
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
            style={[
              styles.result,
              { color: colors.mutedForeground, fontSize: resultFontSize },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
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
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  modeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    marginBottom: 6,
  },
  modeBadge: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  scroll: {
    width: "100%",
    flexGrow: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    minWidth: "100%",
  },
  expression: {
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  result: {
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 4,
  },
});

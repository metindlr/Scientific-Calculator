import React from "react";
import { StyleSheet, View } from "react-native";

import { CalcButton, type CalcButtonVariant } from "@/components/CalcButton";

export type KeypadAction =
  | { type: "digit"; value: string }
  | { type: "operator"; value: string }
  | { type: "function"; value: string }
  | { type: "clear" }
  | { type: "delete" }
  | { type: "negate" }
  | { type: "percent" }
  | { type: "equals" }
  | { type: "decimal" }
  | { type: "constant"; value: string }
  | { type: "scientific"; value: string }
  | { type: "factorial" }
  | { type: "toggleAngle" };

type Key = {
  label: string;
  action: KeypadAction;
  variant?: CalcButtonVariant;
  flex?: number;
};

const basicRows: Key[][] = [
  [
    { label: "AC", action: { type: "clear" }, variant: "function" },
    { label: "⌫", action: { type: "delete" }, variant: "function" },
    { label: "%", action: { type: "percent" }, variant: "function" },
    { label: "÷", action: { type: "operator", value: "/" }, variant: "operator" },
  ],
  [
    { label: "7", action: { type: "digit", value: "7" } },
    { label: "8", action: { type: "digit", value: "8" } },
    { label: "9", action: { type: "digit", value: "9" } },
    { label: "×", action: { type: "operator", value: "*" }, variant: "operator" },
  ],
  [
    { label: "4", action: { type: "digit", value: "4" } },
    { label: "5", action: { type: "digit", value: "5" } },
    { label: "6", action: { type: "digit", value: "6" } },
    { label: "−", action: { type: "operator", value: "-" }, variant: "operator" },
  ],
  [
    { label: "1", action: { type: "digit", value: "1" } },
    { label: "2", action: { type: "digit", value: "2" } },
    { label: "3", action: { type: "digit", value: "3" } },
    { label: "+", action: { type: "operator", value: "+" }, variant: "operator" },
  ],
  [
    { label: "+/−", action: { type: "negate" }, variant: "function" },
    { label: "0", action: { type: "digit", value: "0" } },
    { label: ".", action: { type: "decimal" } },
    { label: "=", action: { type: "equals" }, variant: "equals" },
  ],
];

const scientificRows: Key[][] = [
  [
    { label: "DEG", action: { type: "toggleAngle" }, variant: "scientific" },
    { label: "sin", action: { type: "function", value: "sin(" }, variant: "scientific" },
    { label: "cos", action: { type: "function", value: "cos(" }, variant: "scientific" },
    { label: "tan", action: { type: "function", value: "tan(" }, variant: "scientific" },
    { label: "ln", action: { type: "function", value: "log(" }, variant: "scientific" },
  ],
  [
    { label: "(", action: { type: "scientific", value: "(" }, variant: "scientific" },
    { label: ")", action: { type: "scientific", value: ")" }, variant: "scientific" },
    { label: "x²", action: { type: "scientific", value: "^2" }, variant: "scientific" },
    { label: "x^y", action: { type: "scientific", value: "^" }, variant: "scientific" },
    { label: "log", action: { type: "function", value: "log10(" }, variant: "scientific" },
  ],
  [
    { label: "π", action: { type: "constant", value: "π" }, variant: "scientific" },
    { label: "e", action: { type: "constant", value: "e" }, variant: "scientific" },
    { label: "√", action: { type: "function", value: "sqrt(" }, variant: "scientific" },
    { label: "n!", action: { type: "factorial" }, variant: "scientific" },
    { label: "1/x", action: { type: "scientific", value: "1/(" }, variant: "scientific" },
  ],
];

export type KeypadProps = {
  scientific: boolean;
  angleMode: "deg" | "rad";
  onAction: (action: KeypadAction) => void;
};

export function Keypad({ scientific, angleMode, onAction }: KeypadProps) {
  const renderRow = (row: Key[], rowIdx: number, small = false) => (
    <View key={rowIdx} style={styles.row}>
      {row.map((key) => {
        const label =
          key.action.type === "toggleAngle" ? angleMode.toUpperCase() : key.label;
        return (
          <CalcButton
            key={key.label}
            label={label}
            variant={key.variant}
            flex={key.flex ?? 1}
            small={small}
            onPress={() => onAction(key.action)}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      {scientific && (
        <View style={styles.sciSection}>
          {scientificRows.map((row, idx) => renderRow(row, idx, true))}
        </View>
      )}
      <View style={styles.basicSection}>
        {basicRows.map((row, idx) => renderRow(row, idx + 100, false))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 8,
  },
  sciSection: {
    marginBottom: 6,
  },
  basicSection: {},
  row: {
    flexDirection: "row",
    marginVertical: 4,
  },
});

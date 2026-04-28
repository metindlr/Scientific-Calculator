import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { formatDisplay } from "@/lib/calculator";
import type { HistoryEntry } from "@/lib/storage";

export type HistorySheetProps = {
  visible: boolean;
  onClose: () => void;
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
};

export function HistorySheet({
  visible,
  onClose,
  entries,
  onSelect,
  onClear,
}: HistorySheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad =
    Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.header,
            { paddingTop: topPad + 8, borderBottomColor: colors.border },
          ]}
        >
          <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>
            History
          </Text>
          <Pressable
            onPress={onClear}
            hitSlop={12}
            style={styles.iconBtn}
            disabled={entries.length === 0}
          >
            <Feather
              name="trash-2"
              size={22}
              color={
                entries.length === 0
                  ? colors.mutedForeground
                  : colors.destructive
              }
            />
          </Pressable>
        </View>

        {entries.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="clock" size={42} color={colors.mutedForeground} />
            <Text
              style={[styles.emptyTitle, { color: colors.foreground }]}
            >
              No history yet
            </Text>
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground }]}
            >
              Solved calculations will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: bottomPad + 24,
            }}
            ItemSeparatorComponent={() => (
              <View
                style={[styles.sep, { backgroundColor: colors.border }]}
              />
            )}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                style={({ pressed }) => [
                  styles.item,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Text
                  style={[styles.itemExpr, { color: colors.mutedForeground }]}
                  numberOfLines={1}
                >
                  {formatDisplay(item.expression)}
                </Text>
                <Text
                  style={[styles.itemResult, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  = {item.result}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  item: {
    paddingVertical: 14,
    alignItems: "flex-end",
  },
  itemExpr: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  itemResult: {
    fontSize: 24,
    fontFamily: "Inter_500Medium",
  },
  sep: {
    height: StyleSheet.hairlineWidth,
  },
});

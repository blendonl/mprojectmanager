import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useBoardScreen } from "@/features/boards/hooks";
import EmptyState from "@/shared/components/EmptyState";
import BoardHeader from "./components/BoardHeader";
import BoardColumns from "./components/BoardColumns";
import theme from "@/shared/theme";
import uiConstants from "@/shared/theme/uiConstants";

export default function BoardScreen() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const insets = useSafeAreaInsets();

  const {
    board,
    loading,
    columnActions,
    taskActions,
  } = useBoardScreen(boardId);

  const bottomPadding =
    uiConstants.TAB_BAR_HEIGHT +
    uiConstants.TAB_BAR_BOTTOM_MARGIN +
    insets.bottom +
    theme.spacing.lg;

  if (loading || !board) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading board...</Text>
        </View>
      </View>
    );
  }

  if (!board.columns || board.columns.length === 0) {
    return (
      <EmptyState
        title="No Columns"
        message="This board doesn't have any columns yet. Add columns through the desktop app."
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <BoardHeader description={board.description} />

      <BoardColumns
        columns={board.columns!}
        bottomPadding={bottomPadding}
        onTaskPress={taskActions.handleTaskPress}
        onTaskLongPress={taskActions.handleTaskLongPress}
        onAddTask={taskActions.handleAddItem}
        onColumnMenu={columnActions.handleColumnMenu}
        onCreateColumn={columnActions.handleCreateColumn}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...theme.typography.textStyles.body,
    color: theme.text.secondary,
  },
});

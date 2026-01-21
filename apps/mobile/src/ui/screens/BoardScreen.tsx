import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Board } from "../../domain/entities/Board";
import { Task } from "../../domain/entities/Task";
import { Column } from "../../domain/entities/Column";
import {
  getBoardService,
  getTaskService,
} from "../../core/DependencyContainer";
import ColumnCard from "../components/ColumnCard";
import EmptyState from "../components/EmptyState";
import MoveToColumnModal from "../components/MoveToColumnModal";
import ColumnFormModal from "../components/ColumnFormModal";
import ColumnActionsModal from "../components/ColumnActionsModal";
import AddColumnCard from "../components/AddColumnCard";
import theme from "../theme";
import alertService from "../../services/AlertService";
import logger from "../../utils/logger";
import uiConstants from "../theme/uiConstants";

type BoardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Board"
>;
type BoardScreenRouteProp = RouteProp<RootStackParamList, "Board">;

interface Props {
  navigation: BoardScreenNavigationProp;
  route: BoardScreenRouteProp;
}

export default function BoardScreen({ navigation, route }: Props) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [showColumnActions, setShowColumnActions] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);

  const boardService = getBoardService();
  const taskService = getTaskService();
  const boardId = route.params.boardId;
  const insets = useSafeAreaInsets();

  // Load board on mount
  useEffect(() => {
    const loadBoard = async () => {
      try {
        const loadedBoard = await boardService.getBoardById(boardId);

        if (loadedBoard) {
          setBoard(loadedBoard);
          // Update navigation title
          navigation.setOptions({ title: loadedBoard.name });
        } else {
          alertService.showError("Board not found");
          navigation.goBack();
        }
      } catch (error) {
        logger.error("Failed to load board", error, { boardId });
        alertService.showError("Failed to load board");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [boardId, boardService, navigation]);

  const refreshBoard = useCallback(async () => {
    if (!board) return;

    try {
      const updatedBoard = await boardService.getBoardById(board.id);
      if (updatedBoard) {
        setBoard(updatedBoard);
      }
    } catch (error) {
      logger.error("Failed to refresh board", error, { boardId: board.id });
      alertService.showError("Failed to refresh board");
    }
  }, [board, boardService]);

  const handleTaskPress = (task: Task) => {
    if (!board) return;
    navigation.navigate("ItemDetail", { boardId: board.id, itemId: task.id });
  };

  const handleTaskLongPress = async (task: Task) => {
    // Trigger haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTask(task);
    setShowMoveModal(true);
  };

  const handleMoveToColumn = async (targetColumnId: string) => {
    if (!selectedTask) return;

    try {
      // Find target column
      const targetColumn = board.columns.find(
        (col) => col.id === targetColumnId,
      );
      if (!targetColumn) {
        alertService.showError("Target column not found");
        return;
      }

      // Move task
      await taskService.moveTaskBetweenColumns(
        board,
        selectedTask.id,
        targetColumnId,
      );

      // Trigger success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Refresh board
      await refreshBoard();

      // Close modal
      setShowMoveModal(false);
      setSelectedTask(null);
    } catch (error) {
      logger.error("Failed to move task", error, {
        taskId: selectedTask.id,
        targetColumnId,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alertService.showError("Failed to move task");
    }
  };

  const handleAddItem = (columnId: string) => {
    if (!board) return;
    // Navigate to ItemDetail in create mode with the column ID
    navigation.navigate("ItemDetail", { boardId: board.id, columnId });
  };

  // Column Management Handlers
  const handleCreateColumn = () => {
    setEditingColumn(null);
    setShowColumnForm(true);
  };

  const handleSaveColumn = async (
    name: string,
    limit?: number,
    columnId?: string,
  ) => {
    try {
      if (columnId) {
        await boardService.updateColumn(board, columnId, {
          name,
          limit: limit ?? null,
        });
      } else {
        const column = await boardService.addColumnToBoard(
          board,
          name,
          board.columns.length,
        );
        if (limit !== undefined) {
          await boardService.updateColumn(board, column.id, { limit });
        }
      }

      await refreshBoard();
      alertService.showSuccess(`Column ${columnId ? "updated" : "created"}`);
    } catch (error) {
      logger.error("Failed to save column", error);
      throw error; // Re-throw for modal to handle
    }
  };

  const handleColumnMenu = (column: Column) => {
    setSelectedColumn(column);
    setShowColumnActions(true);
  };

  const handleRenameColumn = () => {
    setEditingColumn(selectedColumn);
    setShowColumnActions(false);
    setShowColumnForm(true);
  };

  const handleMoveColumn = async (direction: "left" | "right") => {
    if (!selectedColumn) return;

    const currentIndex = board.columns.findIndex(
      (c) => c.id === selectedColumn.id,
    );
    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= board.columns.length) return;

    // Swap positions
    const targetColumn = board.columns[newIndex];
    const tempPos = selectedColumn.position;
    selectedColumn.position = targetColumn.position;
    targetColumn.position = tempPos;

    // Re-sort
    board.columns.sort(
      (a, b) => a.position - b.position || a.name.localeCompare(b.name),
    );

    await Promise.all([
      boardService.updateColumn(board, selectedColumn.id, { position: selectedColumn.position }),
      boardService.updateColumn(board, targetColumn.id, { position: targetColumn.position }),
    ]);
    await refreshBoard();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowColumnActions(false);
  };

  const handleClearColumn = async () => {
    if (!selectedColumn || selectedColumn.tasks.length === 0) return;

    Alert.alert(
      "Clear Column",
      `Delete all ${selectedColumn.tasks.length} tasks in "${selectedColumn.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              for (const task of [...selectedColumn.tasks]) {
                await taskService.deleteTask(board, task.id);
              }
              await refreshBoard();
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              setShowColumnActions(false);
            } catch (error) {
              logger.error("Failed to clear column", error);
              alertService.showError("Failed to clear column");
            }
          },
        },
      ],
    );
  };

  const handleMoveAllTasks = () => {
    if (!selectedColumn || selectedColumn.tasks.length === 0) return;
    setShowColumnActions(false);
    // Use the first task to trigger the move modal
    setSelectedTask(selectedColumn.tasks[0]);
    setShowMoveModal(true);
  };

  const handleDeleteColumn = async () => {
    if (!selectedColumn) return;

    if (selectedColumn.tasks.length > 0) {
      alertService.showError(
        "Cannot delete column with tasks. Clear tasks first.",
      );
      return;
    }

    Alert.alert("Delete Column", `Delete "${selectedColumn.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
          onPress: async () => {
            try {
              await boardService.removeColumnFromBoard(board, selectedColumn.id);
              await refreshBoard();
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
            setShowColumnActions(false);
          } catch (error) {
            logger.error("Failed to delete column", error);
            alertService.showError(
              error instanceof Error
                ? error.message
                : "Failed to delete column",
            );
          }
        },
      },
    ]);
  };

  // Listen for navigation changes to refresh board
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      refreshBoard();
    });

    return unsubscribe;
  }, [navigation, refreshBoard]);

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

  if (board.columns.length === 0) {
    return (
      <EmptyState
        title="No Columns"
        message="This board doesn't have any columns yet. Add columns through the desktop app."
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Board Info */}
      {board.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{board.description}</Text>
        </View>
      )}

      {/* Kanban Columns */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        indicatorStyle="white"
        contentContainerStyle={[
          styles.columnsContainer,
          { paddingBottom: bottomPadding },
        ]}
        snapToInterval={296}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {board.columns.map((column) => (
          <ColumnCard
            key={column.id}
            column={column}
            parents={[]}
            onTaskPress={handleTaskPress}
            onTaskLongPress={handleTaskLongPress}
            onAddTask={() => handleAddItem(column.id)}
            onColumnMenu={handleColumnMenu}
          />
        ))}
        <AddColumnCard onPress={handleCreateColumn} />
      </ScrollView>

      {/* Move to Column Modal */}
      {selectedTask && (
        <MoveToColumnModal
          visible={showMoveModal}
          columns={board.columns}
          currentColumnId={selectedTask.column_id}
          onSelectColumn={handleMoveToColumn}
          onClose={() => {
            setShowMoveModal(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Column Form Modal */}
      <ColumnFormModal
        visible={showColumnForm}
        column={editingColumn}
        existingColumns={board.columns}
        onSave={handleSaveColumn}
        onClose={() => {
          setShowColumnForm(false);
          setEditingColumn(null);
        }}
      />

      {/* Column Actions Modal */}
      {selectedColumn && (
        <ColumnActionsModal
          visible={showColumnActions}
          column={selectedColumn}
          canMoveLeft={
            board.columns.findIndex((c) => c.id === selectedColumn.id) > 0
          }
          canMoveRight={
            board.columns.findIndex((c) => c.id === selectedColumn.id) <
            board.columns.length - 1
          }
          onClose={() => {
            setShowColumnActions(false);
            setSelectedColumn(null);
          }}
          onRename={handleRenameColumn}
          onMoveLeft={() => handleMoveColumn("left")}
          onMoveRight={() => handleMoveColumn("right")}
          onClearTasks={handleClearColumn}
          onMoveAllTasks={handleMoveAllTasks}
          onDelete={handleDeleteColumn}
        />
      )}

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
  descriptionContainer: {
    backgroundColor: theme.background.elevated,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  description: {
    ...theme.typography.textStyles.body,
    color: theme.text.secondary,
  },
  columnsContainer: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
});

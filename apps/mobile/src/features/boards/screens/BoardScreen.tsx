import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, ListRenderItem } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@shared/types/navigation';
import { useBoardScreen } from '@features/boards/hooks';
import { ColumnCard, AddColumnCard } from '@features/columns/components';
import { useColumnFormModal } from '@features/columns/hooks';
import { useTaskMoveModal } from '@features/tasks/hooks';
import EmptyState from '@shared/components/EmptyState';
import theme from '@shared/theme';
import uiConstants from '@shared/theme/uiConstants';

type BoardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Board'>;
type BoardScreenRouteProp = RouteProp<RootStackParamList, 'Board'>;

interface Props {
  navigation: BoardScreenNavigationProp;
  route: BoardScreenRouteProp;
}

export default function BoardScreen({ navigation, route }: Props) {
  const { boardId } = route.params;
  const insets = useSafeAreaInsets();

  const {
    board,
    loading,
    refreshing,
    error,
    isAutoRefreshing,
    columnActions,
    taskActions,
    viewState,
    refreshBoard,
    retryLoad,
  } = useBoardScreen(boardId);

  const columnFormModal = useColumnFormModal({
    onSubmit: async (name, wipLimit, columnId) => {
      if (columnId) {
        await columnActions.handleUpdateColumn(columnId, { name, limit: wipLimit ?? null });
      } else {
        await columnActions.handleCreateColumn(name, wipLimit);
      }
    },
  });

  const taskMoveModal = useTaskMoveModal({
    boardId,
    onMove: taskActions.handleMoveTask,
  });

  React.useEffect(() => {
    if (board) {
      navigation.setOptions({ title: board.name });
    }
  }, [board, navigation]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshBoard();
    });
    return unsubscribe;
  }, [navigation, refreshBoard]);

  const handleTaskPress = useCallback(
    (task: any) => taskActions.handleTaskPress(task),
    [taskActions]
  );

  const handleTaskLongPress = useCallback(
    (task: any) => taskMoveModal.open(task),
    [taskMoveModal]
  );

  const handleAddTask = useCallback(
    (columnId: string) => taskActions.handleAddTask(columnId),
    [taskActions]
  );

  const handleColumnMenu = useCallback(
    (column: any) => columnFormModal.openForEdit(column),
    [columnFormModal]
  );

  const renderColumn: ListRenderItem<any> = useCallback(
    ({ item: column }) => (
      <ColumnCard
        column={column}
        showParentGroups={viewState.showParentGroups}
        onTaskPress={handleTaskPress}
        onTaskLongPress={handleTaskLongPress}
        onAddTask={() => handleAddTask(column.id)}
        onColumnMenu={() => handleColumnMenu(column)}
      />
    ),
    [viewState.showParentGroups, handleTaskPress, handleTaskLongPress, handleAddTask, handleColumnMenu]
  );

  const keyExtractor = useCallback((column: any) => column.id, []);

  const ListFooterMemoized = useMemo(
    () => <AddColumnCard onPress={columnFormModal.openForCreate} />,
    [columnFormModal.openForCreate]
  );

  const bottomPadding = useMemo(
    () =>
      uiConstants.TAB_BAR_HEIGHT +
      uiConstants.TAB_BAR_BOTTOM_MARGIN +
      insets.bottom +
      theme.spacing.lg,
    [insets.bottom]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !board) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <EmptyState
          title="Failed to load board"
          message={error.message}
          actionLabel="Retry"
          onAction={retryLoad}
        />
      </SafeAreaView>
    );
  }

  if (!board) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <EmptyState
          title="Board not found"
          message="This board may have been deleted"
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <FlatList
        horizontal
        data={board.columns}
        keyExtractor={keyExtractor}
        renderItem={renderColumn}
        ListFooterComponent={ListFooterMemoized}
        contentContainerStyle={[
          styles.columnList,
          { paddingBottom: bottomPadding },
        ]}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isAutoRefreshing}
            onRefresh={refreshBoard}
            tintColor={theme.colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnList: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
});

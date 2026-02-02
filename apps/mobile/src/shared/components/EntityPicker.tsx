import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
} from 'react-native';
import theme from '../theme/colors';
import { spacing } from '../theme/spacing';
import { ProjectId, BoardId, TaskId } from '../../core/types';
import { getBoardService } from '../../core/di/hooks';
import { projectApi } from '../../features/projects/api/projectApi';
import { BoardDto, EntityType, ProjectDto, TaskDto } from 'shared-types';
import AppIcon, { AppIconName } from './icons/AppIcon';

type Tab = 'projects' | 'boards' | 'tasks';

interface Entity {
  id: string;
  name: string;
  type: EntityType;
}

type BoardWithColumns = BoardDto & {
  columns?: { tasks: TaskDto[] }[];
};

interface EntityPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedProjects: ProjectDto[];
  selectedBoards: BoardDto[];
  selectedTasks: TaskDto[];
  onSelectionChange: (
    projects: ProjectDto[],
    boards: BoardDto[],
    tasks: TaskDto[]
  ) => void;
}

export default function EntityPicker({
  visible,
  onClose,
  selectedProjects,
  selectedBoards,
  selectedTasks,
  onSelectionChange,
}: EntityPickerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsHasMore, setProjectsHasMore] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [boards, setBoards] = useState<BoardWithColumns[]>([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [localSelectedProjects, setLocalSelectedProjects] = useState<ProjectId[]>([]);
  const [localSelectedBoards, setLocalSelectedBoards] = useState<BoardId[]>([]);
  const [localSelectedTasks, setLocalSelectedTasks] = useState<TaskId[]>([]);

  const PROJECT_PAGE_SIZE = 50;

  useEffect(() => {
    if (visible) {
      loadData();
      setLocalSelectedProjects(selectedProjects.map((project) => project.id));
      setLocalSelectedBoards(selectedBoards.map((board) => board.id));
      setLocalSelectedTasks(selectedTasks.map((task) => task.id));
    }
  }, [visible]);

  const collectTasksFromBoards = (loadedBoards: BoardWithColumns[]): TaskDto[] => {
    const allTasks: TaskDto[] = [];
    loadedBoards.forEach((board) => {
      (board.columns ?? []).forEach((column) => {
        allTasks.push(...column.tasks);
      });
    });
    return allTasks;
  };

  const loadProjectsPage = async (page: number, append: boolean) => {
    setProjectsLoading(true);
    try {
      const boardService = getBoardService();
      const result = await projectApi.getProjects({ page, limit: PROJECT_PAGE_SIZE });
      const hasMore = result.page * result.limit < result.total;

      setProjects((prev) => (append ? [...prev, ...result.items] : result.items));
      setProjectsPage(page);
      setProjectsHasMore(hasMore);

      const newBoards = (await Promise.all(
        result.items.map((project) =>
          boardService.getBoardsByProject(project.id).catch(() => []),
        ),
      )).flat();
      const newTasks = collectTasksFromBoards(newBoards);

      setBoards((prev) => (append ? [...prev, ...newBoards] : newBoards));
      setTasks((prev) => (append ? [...prev, ...newTasks] : newTasks));
    } catch (error) {
      console.error('Failed to load entities:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const loadData = async () => {
    await loadProjectsPage(1, false);
  };

  const loadMoreProjects = async () => {
    if (projectsLoading || !projectsHasMore) {
      return;
    }

    const nextPage = projectsPage + 1;
    await loadProjectsPage(nextPage, true);
  };

  const handleDone = () => {
    const selectedProjectObjects = projects.filter((project) =>
      localSelectedProjects.includes(project.id),
    );
    const selectedBoardObjects = boards.filter((board) =>
      localSelectedBoards.includes(board.id),
    );
    const selectedTaskObjects = tasks.filter((task) =>
      localSelectedTasks.includes(task.id),
    );
    onSelectionChange(selectedProjectObjects, selectedBoardObjects, selectedTaskObjects);
    onClose();
  };

  const toggleProject = (projectId: ProjectId) => {
    setLocalSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleBoard = (boardId: BoardId) => {
    setLocalSelectedBoards(prev =>
      prev.includes(boardId)
        ? prev.filter(id => id !== boardId)
        : [...prev, boardId]
    );
  };

  const toggleTask = (taskId: TaskId) => {
    setLocalSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getFilteredEntities = (): Entity[] => {
    const query = searchQuery.toLowerCase();
    let entities: Entity[] = [];

    switch (activeTab) {
      case 'projects':
        entities = projects.map(p => ({
          id: p.id,
          name: p.name,
          type: EntityType.Project,
        }));
        break;
      case 'boards':
        entities = boards.map(b => ({
          id: b.id,
          name: b.name,
          type: EntityType.Board,
        }));
        break;
      case 'tasks':
        entities = tasks.map(t => ({
          id: t.id,
          name: t.title,
          type: EntityType.Task,
        }));
        break;
    }

    if (query) {
      entities = entities.filter(e => e.name.toLowerCase().includes(query));
    }

    return entities;
  };

  const isSelected = (entity: Entity): boolean => {
    switch (entity.type) {
      case EntityType.Project:
        return localSelectedProjects.includes(entity.id);
      case EntityType.Board:
        return localSelectedBoards.includes(entity.id);
      case EntityType.Task:
        return localSelectedTasks.includes(entity.id);
      default:
        return false;
    }
  };

  const toggleEntity = (entity: Entity) => {
    switch (entity.type) {
      case EntityType.Project:
        toggleProject(entity.id);
        break;
      case EntityType.Board:
        toggleBoard(entity.id);
        break;
      case EntityType.Task:
        toggleTask(entity.id);
        break;
    }
  };

  const renderEntityItem = ({ item }: { item: Entity }) => {
    const selected = isSelected(item);
    const icon: AppIconName =
      item.type === EntityType.Project
        ? 'folder'
        : item.type === EntityType.Board
          ? 'board'
          : 'check';

    return (
      <TouchableOpacity
        style={[styles.entityItem, selected && styles.entityItemSelected]}
        onPress={() => toggleEntity(item)}
      >
        <View style={styles.entityItemLeft}>
          <View style={styles.entityIcon}>
            <AppIcon name={icon} size={18} color={theme.text.secondary} />
          </View>
          <Text style={styles.entityName} numberOfLines={1}>{item.name}</Text>
        </View>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && (
            <AppIcon name="check" size={14} color={theme.background.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const entities = getFilteredEntities();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.container}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Connect to...</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'projects' && styles.tabActive]}
              onPress={() => setActiveTab('projects')}
            >
              <Text style={[styles.tabText, activeTab === 'projects' && styles.tabTextActive]}>
                Projects
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'boards' && styles.tabActive]}
              onPress={() => setActiveTab('boards')}
            >
              <Text style={[styles.tabText, activeTab === 'boards' && styles.tabTextActive]}>
                Boards
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'tasks' && styles.tabActive]}
              onPress={() => setActiveTab('tasks')}
            >
              <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
                Tasks
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchIcon}>
              <AppIcon name="search" size={16} color={theme.text.muted} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={theme.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearButton}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={entities}
            renderItem={renderEntityItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            onEndReached={loadMoreProjects}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No {activeTab} found</Text>
              </View>
            }
            ListFooterComponent={
              projectsLoading && projectsHasMore ? (
                <View style={styles.loadingMore}>
                  <Text style={styles.loadingMoreText}>Loading more...</Text>
                </View>
              ) : null
            }
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.modal.overlay,
  },
  modal: {
    flex: 1,
    backgroundColor: theme.glass.background,
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.glass.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text.primary,
  },
  cancelText: {
    fontSize: 16,
    color: theme.accent.primary,
  },
  tabs: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.card.background,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.accent.primary + '30',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text.secondary,
  },
  tabTextActive: {
    color: theme.accent.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: theme.input.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.text.primary,
    fontSize: 15,
  },
  clearButton: {
    fontSize: 24,
    color: theme.text.muted,
    fontWeight: '300',
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingMore: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loadingMoreText: {
    color: theme.text.tertiary,
    fontSize: 12,
  },
  entityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: theme.card.background,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  entityItemSelected: {
    borderColor: theme.accent.primary,
    backgroundColor: theme.accent.primary + '10',
  },
  entityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  entityIcon: {
    marginRight: spacing.sm,
  },
  entityName: {
    fontSize: 15,
    color: theme.text.primary,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.border.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.accent.primary,
    borderColor: theme.accent.primary,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.text.secondary,
    fontSize: 14,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.glass.border,
  },
  doneButton: {
    backgroundColor: theme.accent.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: theme.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

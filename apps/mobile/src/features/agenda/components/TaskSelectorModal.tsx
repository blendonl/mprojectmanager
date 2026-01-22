import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import BaseModal from '@shared/components/BaseModal';
import theme from '@shared/theme';
import AppIcon from '@shared/components/icons/AppIcon';
import { getAgendaService, getProjectService, getGoalService } from '@core/di/hooks';
import { ScheduledTask } from '@features/agenda/services/AgendaService';
import { Project } from '@features/projects/domain/entities/Project';
import { Goal } from '@features/goals/domain/entities/Goal';

interface TaskSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskSelected: (task: ScheduledTask) => void;
}

type FilterType = 'all' | 'project' | 'goal' | 'priority';

export default function TaskSelectorModal({
  visible,
  onClose,
  onTaskSelected,
}: TaskSelectorModalProps) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ScheduledTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsHasMore, setProjectsHasMore] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  const PROJECT_PAGE_SIZE = 50;

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchQuery, selectedFilter, selectedProjectId, selectedGoalId, selectedPriority]);

  const loadData = async () => {
    setLoading(true);
    try {
      const agendaService = getAgendaService();
      const projectService = getProjectService();
      const goalService = getGoalService();

      const [allTasks, projectResult, allGoals] = await Promise.all([
        agendaService.getAllSchedulableTasks(),
        projectService.getProjectsPaginated(1, PROJECT_PAGE_SIZE),
        goalService.getAllGoals(),
      ]);

      setTasks(allTasks);
      setProjects(projectResult.items);
      setProjectsPage(1);
      setProjectsHasMore(projectResult.hasMore);
      setGoals(allGoals);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setProjectsLoading(false);
      setLoading(false);
    }
  };

  const loadMoreProjects = async () => {
    if (projectsLoading || !projectsHasMore) {
      return;
    }

    setProjectsLoading(true);
    try {
      const projectService = getProjectService();
      const nextPage = projectsPage + 1;
      const result = await projectService.getProjectsPaginated(nextPage, PROJECT_PAGE_SIZE);
      setProjects(prev => [...prev, ...result.items]);
      setProjectsPage(nextPage);
      setProjectsHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load more projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(st =>
        st.task.title.toLowerCase().includes(query) ||
        st.task.description.toLowerCase().includes(query)
      );
    }

    if (selectedProjectId) {
      filtered = filtered.filter(st => st.task.project_id === selectedProjectId);
    }

    if (selectedGoalId) {
      filtered = filtered.filter(st => st.task.goal_id === selectedGoalId);
    }

    if (selectedPriority) {
      filtered = filtered.filter(st => st.task.priority === selectedPriority);
    }

    setFilteredTasks(filtered);
  };

  const handleTaskPress = (task: ScheduledTask) => {
    onTaskSelected(task);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.status.error;
      case 'medium': return theme.status.warning;
      case 'low': return theme.status.info;
      default: return theme.text.secondary;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'alert-circle';
      case 'medium': return 'alert-triangle';
      case 'low': return 'info';
      default: return 'minus';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'None';
    }
  };

  const renderTask = ({ item }: { item: ScheduledTask }) => {
    const priorityColor = getPriorityColor(item.task.priority);
    return (
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => handleTaskPress(item)}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleRow}>
            <View style={[styles.priorityBadge, { borderColor: priorityColor, backgroundColor: `${priorityColor}22` }]}>
              <AppIcon
                name={getPriorityIcon(item.task.priority)}
                size={12}
                color={priorityColor}
              />
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {getPriorityLabel(item.task.priority)}
              </Text>
            </View>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {item.task.title}
            </Text>
          </View>
        </View>
        <Text style={styles.taskMeta} numberOfLines={1}>
          {item.projectName || 'No project'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFilterChips = () => (
    <View style={styles.filterChipsContainer}>
      <TouchableOpacity
        style={[
          styles.filterChip,
          selectedFilter === 'all' && styles.filterChipActive,
        ]}
        onPress={() => {
          setSelectedFilter('all');
          setSelectedProjectId(null);
          setSelectedGoalId(null);
          setSelectedPriority(null);
        }}
      >
        <Text
          style={[
            styles.filterChipText,
            selectedFilter === 'all' && styles.filterChipTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterChip,
          selectedFilter === 'priority' && styles.filterChipActive,
        ]}
        onPress={() => setSelectedFilter('priority')}
      >
        <Text
          style={[
            styles.filterChipText,
            selectedFilter === 'priority' && styles.filterChipTextActive,
          ]}
        >
          Priority
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterChip,
          selectedFilter === 'project' && styles.filterChipActive,
        ]}
        onPress={() => setSelectedFilter('project')}
      >
        <Text
          style={[
            styles.filterChipText,
            selectedFilter === 'project' && styles.filterChipTextActive,
          ]}
        >
          Project
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterChip,
          selectedFilter === 'goal' && styles.filterChipActive,
        ]}
        onPress={() => setSelectedFilter('goal')}
      >
        <Text
          style={[
            styles.filterChipText,
            selectedFilter === 'goal' && styles.filterChipTextActive,
          ]}
        >
          Goal
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterOptions = () => {
    if (selectedFilter === 'priority') {
      return (
        <View style={styles.filterOptionsContainer}>
          {['high', 'medium', 'low', 'none'].map(priority => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.filterOption,
                selectedPriority === priority && styles.filterOptionActive,
              ]}
              onPress={() => setSelectedPriority(selectedPriority === priority ? null : priority)}
            >
              <AppIcon
                name={getPriorityIcon(priority)}
                size={14}
                color={getPriorityColor(priority)}
              />
              <Text style={styles.filterOptionText}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (selectedFilter === 'project') {
      return (
        <View style={styles.filterOptionsContainer}>
          {projects.map(project => (
            <TouchableOpacity
              key={project.id}
              style={[
                styles.filterOption,
                selectedProjectId === project.id && styles.filterOptionActive,
              ]}
              onPress={() => setSelectedProjectId(selectedProjectId === project.id ? null : project.id)}
            >
              <Text style={styles.filterOptionText}>{project.name}</Text>
            </TouchableOpacity>
          ))}
          {projectsHasMore && (
            <TouchableOpacity
              style={styles.loadMoreOption}
              onPress={loadMoreProjects}
              disabled={projectsLoading}
            >
              <Text style={styles.loadMoreText}>
                {projectsLoading ? 'Loading more...' : 'Load more projects'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (selectedFilter === 'goal') {
      return (
        <View style={styles.filterOptionsContainer}>
          {goals.map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.filterOption,
                selectedGoalId === goal.id && styles.filterOptionActive,
              ]}
              onPress={() => setSelectedGoalId(selectedGoalId === goal.id ? null : goal.id)}
            >
              <Text style={styles.filterOptionText}>{goal.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Select Task to Schedule"
      scrollable={false}
    >
      <View style={styles.searchContainer}>
        <AppIcon name="search" size={18} color={theme.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={theme.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersCard}>
        {renderFilterChips()}
        {renderFilterOptions()}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppIcon name="inbox" size={48} color={theme.text.secondary} />
          <Text style={styles.emptyText}>No tasks found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={item => `${item.boardId}-${item.task.id}`}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.input.background,
    borderRadius: theme.radius.input,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.input.border,
  },
  searchInput: {
    flex: 1,
    color: theme.text.primary,
    fontSize: theme.typography.fontSizes.base,
  },
  filtersCard: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  filterChipActive: {
    backgroundColor: theme.accent.primary,
    borderColor: theme.accent.primary,
  },
  filterChipText: {
    color: theme.text.secondary,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: theme.background.primary,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  filterOptionActive: {
    backgroundColor: theme.accent.primary + '1F',
    borderColor: theme.accent.primary,
  },
  filterOptionText: {
    color: theme.text.secondary,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: '600',
  },
  loadMoreOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border.primary,
    backgroundColor: theme.card.background,
  },
  loadMoreText: {
    color: theme.text.secondary,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: '600',
  },
  list: {
    maxHeight: 400,
  },
  listContent: {
    gap: theme.spacing.sm,
  },
  taskItem: {
    padding: theme.spacing.md,
    backgroundColor: theme.card.background,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  taskHeader: {
    marginBottom: theme.spacing.xs,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: '700',
  },
  taskTitle: {
    ...theme.typography.textStyles.body,
    color: theme.text.primary,
    flex: 1,
  },
  taskMeta: {
    ...theme.typography.textStyles.caption,
    color: theme.text.secondary,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.textStyles.body,
    color: theme.text.secondary,
  },
});

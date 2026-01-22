import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Screen } from "@shared/components/Screen";
import { spacing } from "@shared/theme/spacing";
import theme from "@shared/theme/colors";
import { Goal } from "@features/goals/domain/entities/Goal";
import { Project } from "@domain/entities/Project";
import { getGoalService, getProjectService } from "@core/di/hooks";
import GoalFormModal from "../components/GoalFormModal";
import GlassCard from "@shared/components/GlassCard";
import { PlusIcon } from "@shared/components/icons/TabIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { GoalsStackParamList } from "@/ui/navigation/TabNavigator";
import { GoalProgress } from "@services/GoalService";

type GoalsListNavProp = StackNavigationProp<GoalsStackParamList, "GoalsList">;

export default function GoalsListScreen() {
  const navigation = useNavigation<GoalsListNavProp>();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsHasMore, setProjectsHasMore] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, GoalProgress>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const PROJECT_PAGE_SIZE = 50;

  const loadData = useCallback(async () => {
    try {
      setProjectsLoading(true);
      const goalService = getGoalService();
      const projectService = getProjectService();
      const [loadedGoals, projectResult] = await Promise.all([
        goalService.getAllGoals(),
        projectService.getProjectsPaginated(1, PROJECT_PAGE_SIZE),
      ]);
      setGoals(loadedGoals);
      setProjects(projectResult.items);
      setProjectsPage(1);
      setProjectsHasMore(projectResult.hasMore);

      const progressEntries = await Promise.all(
        loadedGoals.map(async (goal) => {
          const progress = await goalService.getGoalProgress(goal.id);
          return [goal.id, progress] as const;
        })
      );
      setProgressMap(Object.fromEntries(progressEntries));
    } catch (error) {
      console.error("Failed to load goals:", error);
    } finally {
      setProjectsLoading(false);
      setLoading(false);
    }
  }, []);

  const loadMoreProjects = useCallback(async () => {
    if (projectsLoading || !projectsHasMore) {
      return;
    }

    setProjectsLoading(true);
    try {
      const projectService = getProjectService();
      const nextPage = projectsPage + 1;
      const result = await projectService.getProjectsPaginated(nextPage, PROJECT_PAGE_SIZE);
      setProjects((prev) => [...prev, ...result.items]);
      setProjectsPage(nextPage);
      setProjectsHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load more projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  }, [projectsLoading, projectsHasMore, projectsPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleCreateGoal = async (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    projectIds: string[];
  }) => {
    const goalService = getGoalService();
    await goalService.createGoal(
      data.title,
      data.description,
      data.startDate,
      data.endDate,
      data.projectIds
    );
    await loadData();
  };

  const renderGoal = ({ item }: { item: Goal }) => {
    const progress = progressMap[item.id];
    const progressPercent = progress?.percentComplete || 0;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("GoalDetail", { goalId: item.id })}
      >
        <GlassCard style={styles.goalCard}>
          <Text style={styles.goalTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.goalDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {item.start_date} → {item.end_date}
            </Text>
            <Text style={styles.metaText}>
              {item.project_ids.length} project{item.project_ids.length === 1 ? '' : 's'}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{progressPercent}% complete</Text>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Goals Yet</Text>
      <Text style={styles.emptyText}>
        Create a goal to track long-term ideas, habits, and outcomes.
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>Create Goal</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <Screen hasTabBar>
        <Text style={styles.loadingText}>Loading goals...</Text>
      </Screen>
    );
  }

  return (
    <Screen hasTabBar>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={renderGoal}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent.primary}
          />
        }
        contentContainerStyle={goals.length === 0 ? styles.emptyList : styles.list}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <PlusIcon size={24} focused color="#ffffff" />
      </TouchableOpacity>

      <GoalFormModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGoal}
        projects={projects}
        onLoadMoreProjects={loadMoreProjects}
        hasMoreProjects={projectsHasMore}
        projectsLoading={projectsLoading}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  loadingText: {
    color: theme.text.secondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  goalCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text.primary,
    marginBottom: spacing.xs,
  },
  goalDescription: {
    fontSize: 13,
    color: theme.text.secondary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: 12,
    color: theme.text.tertiary,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.border.secondary,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.accent.primary,
  },
  progressLabel: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: theme.text.secondary,
  },
  emptyContainer: {
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: theme.text.tertiary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  createButton: {
    backgroundColor: theme.accent.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  createButtonText: {
    color: theme.background.primary,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: 110,
    backgroundColor: theme.accent.primary,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

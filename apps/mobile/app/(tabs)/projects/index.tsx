import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Screen } from "@shared/components";
import { useRouter } from "expo-router";
import { theme, spacing } from "@shared/theme";
import { Project } from "../../../src/domain/entities/Project";
import { getProjectService } from "../../../src/core/di/hooks";
import { useProjectContext } from "../../../src/core/ProjectContext";
import ProjectCreateModal from "../../../src/features/projects/components/ProjectCreateModal";
import {
  ProjectsIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@shared/components/icons/TabIcons";
import GlassCard from "@shared/components/GlassCard";

export default function ProjectListScreen() {
  const router = useRouter();
  const { setCurrentProject } = useProjectContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadProjects = useCallback(async (page = 1, append = false) => {
    try {
      const projectService = getProjectService();
      const result = await projectService.getProjectsPaginated(page, 20);

      if (append) {
        setProjects(prev => [...prev, ...result.items]);
      } else {
        setProjects(result.items);
        setCurrentPage(1);
      }

      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMoreProjects = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    await loadProjects(nextPage, true);
    setCurrentPage(nextPage);
  }, [hasMore, loadingMore, currentPage, loadProjects]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProjects(1, false);
    setRefreshing(false);
  }, [loadProjects]);

  const handleCreateProject = async (
    name: string,
    description: string,
    color: string,
  ) => {
    const projectService = getProjectService();
    await projectService.createProject(name, description, color);
    await loadProjects();
  };

  const handleProjectPress = (project: Project) => {
    setCurrentProject(project);
    router.push(`/projects/${project.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return theme.accent.success;
      case "paused":
        return theme.accent.warning;
      case "archived":
        return theme.text.muted;
      default:
        return theme.text.tertiary;
    }
  };

  const renderProject = ({ item }: { item: Project }) => {
    const statusColor = getStatusColor(item.status);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleProjectPress(item)}
      >
        <GlassCard style={styles.projectCard}>
          <View style={styles.cardContent}>
            <View
              style={[
                styles.colorIndicator,
                {
                  backgroundColor: item.color,
                },
              ]}
            />
            <View style={styles.projectInfo}>
              <View style={styles.headerRow}>
                <Text style={styles.projectName} numberOfLines={1}>
                  {item.name}
                </Text>
                <ChevronRightIcon size={18} focused={false} />
              </View>
              {item.description ? (
                <Text style={styles.projectDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <View style={styles.bottomRow}>
                <View style={styles.spacer} />
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + "15" },
                  ]}
                >
                  <View
                    style={[styles.statusDot, { backgroundColor: statusColor }]}
                  />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <ProjectsIcon size={64} focused={false} />
      </View>
      <Text style={styles.emptyTitle}>No Projects Yet</Text>
      <Text style={styles.emptyText}>
        Create your first project to organize your boards, notes, and time
        tracking.
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>Create Project</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <Screen hasTabBar>
        <Text style={styles.loadingText}>Loading projects...</Text>
      </Screen>
    );
  }

  return (
    <Screen hasTabBar>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent.primary}
          />
        }
        onEndReached={loadMoreProjects}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : null
        }
        contentContainerStyle={
          projects.length === 0 ? styles.emptyList : styles.list
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <PlusIcon size={24} focused color="#ffffff" />
      </TouchableOpacity>

      <ProjectCreateModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  loadingText: {
    color: theme.text.secondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  loadingMore: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  loadingMoreText: {
    color: theme.text.secondary,
    fontSize: 14,
  },
  projectCard: {
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: "row",
    gap: spacing.md,
  },
  colorIndicator: {
    width: 6,
    borderRadius: 3,
    minHeight: 80,
    alignSelf: "stretch",
  },
  projectInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  projectName: {
    color: theme.text.primary,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    letterSpacing: -0.3,
  },
  projectDescription: {
    color: theme.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  spacer: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyIconContainer: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: theme.text.primary,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: theme.text.secondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  createButton: {
    backgroundColor: theme.accent.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  createButtonText: {
    color: theme.background.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.accent.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

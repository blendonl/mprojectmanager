import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import EntityChip from '@shared/components/EntityChip';
import { EntityType, BoardDto, ProjectDto, TaskDto } from 'shared-types';

interface NoteEntitiesSectionProps {
  selectedProjects: ProjectDto[];
  selectedBoards: BoardDto[];
  selectedTasks: TaskDto[];
  entityNames: {
    projects: Map<string, string>;
    boards: Map<string, string>;
    tasks: Map<string, string>;
  };
  onAddEntity: () => void;
  onRemoveProject: (id: string) => void;
  onRemoveBoard: (id: string) => void;
  onRemoveTask: (id: string) => void;
}

export const NoteEntitiesSection: React.FC<NoteEntitiesSectionProps> = ({
  selectedProjects,
  selectedBoards,
  selectedTasks,
  entityNames,
  onAddEntity,
  onRemoveProject,
  onRemoveBoard,
  onRemoveTask,
}) => {
  return (
    <View style={styles.entitiesSection}>
      <Text style={styles.sectionLabel}>Connected To</Text>
      <View style={styles.entityChipsContainer}>
        {selectedProjects.map((project) => (
          <EntityChip
            key={project.id}
            entityType={EntityType.Project}
            entityId={project.id}
            entityName={project.name || entityNames.projects.get(project.id) || project.id}
            onRemove={onRemoveProject}
          />
        ))}
        {selectedBoards.map((board) => (
          <EntityChip
            key={board.id}
            entityType={EntityType.Board}
            entityId={board.id}
            entityName={board.name || entityNames.boards.get(board.id) || board.id}
            onRemove={onRemoveBoard}
          />
        ))}
        {selectedTasks.map((task) => (
          <EntityChip
            key={task.id}
            entityType={EntityType.Task}
            entityId={task.id}
            entityName={task.title || entityNames.tasks.get(task.id) || task.id}
            onRemove={onRemoveTask}
          />
        ))}
        <TouchableOpacity
          style={styles.addEntityButton}
          onPress={onAddEntity}
        >
          <Text style={styles.addEntityButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  entitiesSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionLabel: {
    color: theme.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  entityChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  addEntityButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: theme.glass.tint.blue,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.accent.primary,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  addEntityButtonText: {
    color: theme.accent.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});

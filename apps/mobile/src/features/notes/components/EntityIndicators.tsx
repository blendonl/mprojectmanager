import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@shared/theme';
import { spacing } from '@shared/theme/spacing';
import { NoteDetailDto } from 'shared-types';
import AppIcon, { AppIconName } from '@shared/components/icons/AppIcon';

interface EntityIndicatorsProps {
  note: NoteDetailDto;
  entityNames: {
    projects: Map<string, string>;
    boards: Map<string, string>;
    tasks: Map<string, string>;
  };
}

export const EntityIndicators: React.FC<EntityIndicatorsProps> = ({ note, entityNames }) => {
  const entities: { icon: AppIconName; name: string }[] = [];
  const projects = note.projects ?? [];
  const boards = note.boards ?? [];
  const tasks = note.tasks ?? [];

  projects.slice(0, 1).forEach((project) => {
    const name = project.name || entityNames.projects.get(project.id) || project.id;
    entities.push({ icon: 'folder' as AppIconName, name });
  });

  boards.slice(0, 1).forEach((board) => {
    const name = board.name || entityNames.boards.get(board.id) || board.id;
    entities.push({ icon: 'board' as AppIconName, name });
  });

  const taskCount = tasks.length;
  if (taskCount > 0) {
    entities.push({ icon: 'check', name: `${taskCount} task${taskCount > 1 ? 's' : ''}` });
  }

  const totalEntities = projects.length + boards.length + tasks.length;
  const showing = entities.length;
  const remaining = totalEntities - showing;

  if (entities.length === 0) return null;

  return (
    <View style={styles.entityIndicators}>
      {entities.map((entity, index) => (
        <View key={`${entity.name}-${index}`} style={styles.entityIndicatorItem}>
          <AppIcon name={entity.icon} size={12} color={theme.text.tertiary} />
          <Text style={styles.entityIndicatorText}>{entity.name}</Text>
          {index < entities.length - 1 && (
            <Text style={styles.entityIndicatorSeparator}>•</Text>
          )}
        </View>
      ))}
      {remaining > 0 && (
        <Text style={styles.entityIndicatorText}>+{remaining} more</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  entityIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  entityIndicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: spacing.xs,
  },
  entityIndicatorText: {
    color: theme.text.tertiary,
    fontSize: 11,
  },
  entityIndicatorSeparator: {
    color: theme.text.tertiary,
    fontSize: 11,
    marginLeft: spacing.xs,
  },
});

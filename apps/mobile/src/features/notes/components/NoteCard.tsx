import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import theme from '@shared/theme';
import { spacing } from '@shared/theme/spacing';
import { NoteDetailDto, NoteType } from 'shared-types';
import AppIcon, { AppIconName } from '@shared/components/icons/AppIcon';
import { EntityIndicators } from './EntityIndicators';

const NOTE_TYPE_ICONS: Record<NoteType, AppIconName> = {
  [NoteType.General]: 'note',
  [NoteType.Meeting]: 'users',
  [NoteType.Daily]: 'calendar',
  [NoteType.Task]: 'check',
};

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  [NoteType.General]: 'Note',
  [NoteType.Meeting]: 'Meeting',
  [NoteType.Daily]: 'Daily',
  [NoteType.Task]: 'Task',
};

interface NoteCardProps {
  note: NoteDetailDto;
  entityNames: {
    projects: Map<string, string>;
    boards: Map<string, string>;
    tasks: Map<string, string>;
  };
  onPress?: (note: NoteDetailDto) => void;
}

const formatDate = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const NoteCard = React.memo<NoteCardProps>(({ note, entityNames, onPress }) => {
  const router = useRouter();
  const noteType = note.type ?? NoteType.General;
  const icon = NOTE_TYPE_ICONS[noteType];
  const tags = note.tags ?? [];
  const preview = note.preview ?? (note.content ? note.content.slice(0, 160) : null);
  const wordCount = note.wordCount ?? note.content.trim().split(/\s+/).filter(Boolean).length;
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(note);
      return;
    }
    router.push(`/notes/${note.id}`);
  }, [note, onPress, router]);

  return (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.noteCardTop}>
        <View style={styles.noteIconWrap}>
          <AppIcon name={icon} size={18} color={theme.text.secondary} />
        </View>
        <View style={styles.noteBody}>
          <View style={styles.noteHeader}>
            <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
            <Text style={styles.noteDate}>{formatDate(note.updatedAt)}</Text>
          </View>
          {preview && (
            <Text style={styles.notePreview} numberOfLines={3}>{preview}</Text>
          )}
          <EntityIndicators note={note} entityNames={entityNames} />
          <View style={styles.noteMeta}>
            <View style={styles.noteMetaLeft}>
              {tags.length > 0 && (
                <View style={styles.tagRow}>
                  {tags.slice(0, 3).map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                  {tags.length > 3 && (
                    <Text style={styles.moreTagsText}>+{tags.length - 3}</Text>
                  )}
                </View>
              )}
              <View style={styles.noteTypeBadge}>
                <View style={styles.noteTypeContent}>
                  <AppIcon name={icon} size={12} color={theme.text.secondary} />
                  <Text style={styles.noteTypeText}>
                    {NOTE_TYPE_LABELS[noteType]}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.wordCount}>{wordCount} words</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

NoteCard.displayName = 'NoteCard';

const styles = StyleSheet.create({
  noteCard: {
    backgroundColor: theme.background.secondary,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  noteIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.glass.tint.neutral,
    borderWidth: 1,
    borderColor: theme.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  noteBody: {
    flex: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: spacing.sm,
  },
  noteTitle: {
    flex: 1,
    color: theme.text.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  noteDate: {
    color: theme.text.muted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  notePreview: {
    color: theme.text.secondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  noteMetaLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: theme.accent.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: spacing.xs,
  },
  tagText: {
    color: theme.accent.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  moreTagsText: {
    color: theme.text.muted,
    fontSize: 11,
  },
  noteTypeBadge: {
    backgroundColor: theme.glass.tint.neutral,
    borderWidth: 1,
    borderColor: theme.glass.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noteTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteTypeText: {
    color: theme.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  wordCount: {
    color: theme.text.muted,
    fontSize: 11,
  },
});

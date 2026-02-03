import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import AppIcon from '@shared/components/icons/AppIcon';
import { AgendaItemCard } from '../AgendaItemCard';

interface UnfinishedDrawerProps {
  isOpen: boolean;
  items: AgendaItemEnrichedDto[];
  onClose: () => void;
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onItemLongPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.6;

export const UnfinishedDrawer: React.FC<UnfinishedDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onItemPress,
  onItemLongPress,
  onToggleComplete,
}) => {
  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.drawer} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <AppIcon name="alert" size={20} color={theme.text.primary} />
              <Text style={styles.headerTitle}>Unfinished Tasks</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{items.length}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AppIcon name="x" size={20} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {items.map(item => (
              <AgendaItemCard
                key={item.id}
                item={item}
                onPress={() => {
                  onClose();
                  onItemPress(item);
                }}
                onLongPress={() => {
                  onClose();
                  onItemLongPress(item);
                }}
                onToggleComplete={() => onToggleComplete(item)}
              />
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: theme.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: MAX_HEIGHT,
    paddingBottom: spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border.primary,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
  },
  countBadge: {
    backgroundColor: theme.background.elevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background.elevated,
  },
  content: {
    maxHeight: MAX_HEIGHT - 100,
  },
  contentContainer: {
    padding: spacing.lg,
  },
});

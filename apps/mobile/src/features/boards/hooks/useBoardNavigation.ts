import { useEffect } from 'react';
import { useNavigation } from 'expo-router';
import { BoardDetailDto } from 'shared-types';

interface UseBoardNavigationProps {
  board: BoardDetailDto | null;
  refreshBoard: () => Promise<void>;
}

export function useBoardNavigation({ board, refreshBoard }: UseBoardNavigationProps) {
  const navigation = useNavigation();

  // Update navigation title when board loads
  useEffect(() => {
    if (board) {
      navigation.setOptions({ title: board.name });
    }
  }, [board, navigation]);

  // Listen for navigation focus to refresh board
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus' as any, () => {
      refreshBoard();
    });

    return unsubscribe;
  }, [navigation, refreshBoard]);
}

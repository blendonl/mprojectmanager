export { default as BoardScreen } from './screens/BoardScreen';
export { default as BoardListScreen } from './screens/BoardListScreen';

export { Board } from './domain/entities/Board';
export type { BoardRepository } from './domain/repositories/BoardRepository';
export { BoardService } from './services/BoardService';
export { BackendBoardRepository } from './infrastructure/BackendBoardRepository';

export {
  useBoardScreen,
  useBoardData,
  useBoardModals,
  useBoardNavigation,
} from './hooks';

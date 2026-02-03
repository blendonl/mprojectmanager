import { useState } from 'react';

export const useUnfinishedTasks = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
  };
};

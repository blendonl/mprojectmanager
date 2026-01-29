import { useMemo } from 'react';
import { Task } from '@features/tasks/domain/entities/Task';
import { Parent } from '@domain/entities/Parent';
import { TaskPriority } from '@mprojectmanager/shared-types';

interface GroupedTasks {
  parentId: string | null;
  parent: Parent | null;
  tasks: Task[];
  taskCount: number;
}

interface UseColumnGroupingOptions {
  tasks: Task[];
  parents: Parent[];
  showParentGroups: boolean;
  sortByPriority?: boolean;
}

interface UseColumnGroupingReturn {
  groupedTasks: GroupedTasks[];
  totalTaskCount: number;
  orphanedTaskCount: number;
  groupCount: number;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  [TaskPriority.URGENT]: 0,
  [TaskPriority.HIGH]: 1,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.LOW]: 3,
};

export function useColumnGrouping(
  options: UseColumnGroupingOptions
): UseColumnGroupingReturn {
  const { tasks, parents, showParentGroups, sortByPriority = false } = options;

  const parentMap = useMemo(() => {
    const map = new Map<string, Parent>();
    parents.forEach((parent) => {
      map.set(parent.id, parent);
    });
    return map;
  }, [parents]);

  const groupedTasks = useMemo((): GroupedTasks[] => {
    if (!showParentGroups) {
      const sortedTasks = sortByPriority
        ? [...tasks].sort((a, b) => {
            const aPriority = PRIORITY_ORDER[a.priority] ?? 3;
            const bPriority = PRIORITY_ORDER[b.priority] ?? 3;
            return aPriority - bPriority;
          })
        : tasks;

      return [
        {
          parentId: null,
          parent: null,
          tasks: sortedTasks,
          taskCount: tasks.length,
        },
      ];
    }

    const groups = new Map<string | null, Task[]>();

    tasks.forEach((task) => {
      const parentId = task.parent_id || null;
      if (!groups.has(parentId)) {
        groups.set(parentId, []);
      }
      groups.get(parentId)!.push(task);
    });

    const result: GroupedTasks[] = Array.from(groups.entries()).map(([parentId, groupTasks]) => {
      const sortedTasks = sortByPriority
        ? [...groupTasks].sort((a, b) => {
            const aPriority = PRIORITY_ORDER[a.priority] ?? 3;
            const bPriority = PRIORITY_ORDER[b.priority] ?? 3;
            if (aPriority !== bPriority) {
              return aPriority - bPriority;
            }
            return a.position - b.position;
          })
        : [...groupTasks].sort((a, b) => a.position - b.position);

      return {
        parentId,
        parent: parentId ? parentMap.get(parentId) || null : null,
        tasks: sortedTasks,
        taskCount: groupTasks.length,
      };
    });

    return result.sort((a, b) => {
      if (a.parentId === null) return -1;
      if (b.parentId === null) return 1;

      if (sortByPriority && a.tasks.length > 0 && b.tasks.length > 0) {
        const aHighestPriority = Math.min(...a.tasks.map((t) => PRIORITY_ORDER[t.priority] ?? 3));
        const bHighestPriority = Math.min(...b.tasks.map((t) => PRIORITY_ORDER[t.priority] ?? 3));
        if (aHighestPriority !== bHighestPriority) {
          return aHighestPriority - bHighestPriority;
        }
      }

      const aParentName = a.parent?.name || '';
      const bParentName = b.parent?.name || '';
      return aParentName.localeCompare(bParentName);
    });
  }, [tasks, parentMap, showParentGroups, sortByPriority]);

  const totalTaskCount = useMemo(() => tasks.length, [tasks.length]);

  const orphanedTaskCount = useMemo(() => {
    return tasks.filter((task) => task.parent_id === null).length;
  }, [tasks]);

  const groupCount = useMemo(() => {
    if (!showParentGroups) return 1;
    return groupedTasks.length;
  }, [showParentGroups, groupedTasks.length]);

  return {
    groupedTasks,
    totalTaskCount,
    orphanedTaskCount,
    groupCount,
  };
}

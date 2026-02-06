import { AgendaItemEnriched } from '../../agenda-item/usecase/agenda.get-enriched-by-date.usecase';

export interface TimedItemLayoutInput {
  item: AgendaItemEnriched;
  startMinute: number;
  durationMinutes: number;
}

export interface TimedItemLayout extends TimedItemLayoutInput {
  overlapIndex: number;
  overlapCount: number;
}

interface TimedItemWithEnd extends TimedItemLayoutInput {
  endMinute: number;
}

const toTimedWithEnd = (item: TimedItemLayoutInput): TimedItemWithEnd => ({
  ...item,
  endMinute: item.startMinute + item.durationMinutes,
});

const assignColumns = (items: TimedItemWithEnd[]): TimedItemLayout[] => {
  const columns: { endMinute: number }[] = [];
  const layout = new Map<string, { overlapIndex: number; overlapCount: number }>();

  items.forEach((current) => {
    let columnIndex = columns.findIndex((column) => column.endMinute <= current.startMinute);
    if (columnIndex === -1) {
      columnIndex = columns.length;
      columns.push({ endMinute: current.endMinute });
    } else {
      columns[columnIndex].endMinute = current.endMinute;
    }
    layout.set(current.item.id, { overlapIndex: columnIndex, overlapCount: 0 });
  });

  const overlapCount = columns.length;
  return items.map((item) => ({
    item: item.item,
    startMinute: item.startMinute,
    durationMinutes: item.durationMinutes,
    overlapIndex: layout.get(item.item.id)?.overlapIndex ?? 0,
    overlapCount,
  }));
};

export const assignOverlapLayout = (items: TimedItemLayoutInput[]): TimedItemLayout[] => {
  if (items.length === 0) return [];

  const sorted = items
    .map(toTimedWithEnd)
    .sort((a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute);

  const result: TimedItemLayout[] = [];
  let cluster: TimedItemWithEnd[] = [];
  let clusterEnd = -1;

  const flushCluster = () => {
    if (cluster.length === 0) return;
    result.push(...assignColumns(cluster));
    cluster = [];
    clusterEnd = -1;
  };

  sorted.forEach((item) => {
    if (cluster.length === 0) {
      cluster = [item];
      clusterEnd = item.endMinute;
      return;
    }

    if (item.startMinute < clusterEnd) {
      cluster.push(item);
      clusterEnd = Math.max(clusterEnd, item.endMinute);
      return;
    }

    flushCluster();
    cluster = [item];
    clusterEnd = item.endMinute;
  });

  flushCluster();
  return result;
};

import { assignOverlapLayout } from './agenda-view-layout.utils';
import { AgendaItemEnriched } from '../../agenda-item/usecase/agenda.get-enriched-by-date.usecase';

const buildItem = (id: string): AgendaItemEnriched =>
  ({ id } as AgendaItemEnriched);

describe('agenda-view-layout.utils', () => {
  it('assigns overlap columns per cluster', () => {
    const items = assignOverlapLayout([
      { item: buildItem('a'), startMinute: 540, durationMinutes: 60 },
      { item: buildItem('b'), startMinute: 570, durationMinutes: 60 },
      { item: buildItem('c'), startMinute: 630, durationMinutes: 30 },
    ]);

    const itemA = items.find((item) => item.item.id === 'a');
    const itemB = items.find((item) => item.item.id === 'b');
    const itemC = items.find((item) => item.item.id === 'c');

    expect(itemA?.overlapCount).toBe(2);
    expect(itemB?.overlapCount).toBe(2);
    expect(itemC?.overlapCount).toBe(1);
  });
});

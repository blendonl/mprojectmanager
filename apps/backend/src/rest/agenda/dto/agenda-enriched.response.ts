import { AgendaItemEnrichedResponse } from '../../agenda-item/dto/agenda-item-enriched.response';

export interface AgendaEnrichedResponse {
  id: string;
  date: string;
  items: AgendaItemEnrichedResponse[];
  createdAt: string;
  updatedAt: string;
}

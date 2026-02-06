import { AppIconName } from "@shared/components/icons/AppIcon";
import { ScheduledAgendaItem } from "@features/agenda/domain/interfaces/AgendaService.interface";

export type ViewMode = "day" | "week" | "month";

export type SearchMode = "all" | "unfinished";

export interface AgendaSection {
  title: string;
  icon: AppIconName;
  data: ScheduledAgendaItem[];
}

export interface SearchSection {
  title: string;
  data: ScheduledAgendaItem[];
}

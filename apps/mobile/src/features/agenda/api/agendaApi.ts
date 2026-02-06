import { apiClient } from '@infrastructure/api/apiClient';
import {
  AgendaFindAllResponse,
  AgendaItemEnrichedDto,
  AgendaItemsFindAllResponse,
  AgendaItemCreateRequestDto,
  AgendaItemUpdateRequestDto,
  AgendaViewMode,
  AgendaViewResponseDto,
} from 'shared-types';

type AgendaItemCreateInput = AgendaItemCreateRequestDto & {
  type?: string;
  status?: string;
  scheduledTime?: string | null;
  durationMinutes?: number | null;
  notificationId?: string | null;
};

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

const normalizeAgendaItemType = (value?: string): string | undefined => {
  if (!value) return undefined;
  const normalized = value.toUpperCase();

  if (normalized === 'MEETING') return 'MEETING';
  if (normalized === 'MILESTONE') return 'MILESTONE';
  if (normalized === 'SUBTASK' || normalized === 'REGULAR' || normalized === 'TASK') {
    return 'TASK';
  }

  return undefined;
};

const normalizeAgendaItemStatus = (value?: string): string | undefined => {
  if (!value) return undefined;
  const normalized = value.toUpperCase();

  if (normalized === 'PENDING') return 'PENDING';
  if (normalized === 'COMPLETED') return 'COMPLETED';
  if (normalized === 'UNFINISHED') return 'UNFINISHED';
  if (normalized === 'CANCELLED' || normalized === 'CANCELED') return 'CANCELLED';
  if (normalized === 'SKIPPED') return 'CANCELLED';

  return undefined;
};

const resolveStartAt = (
  agendaId: string,
  startAt?: string,
  scheduledTime?: string | null,
): string | undefined => {
  if (startAt) return startAt;
  if (!scheduledTime || !dateOnlyPattern.test(agendaId)) return undefined;

  const hasSeconds = scheduledTime.length === 8 && scheduledTime.includes(':');
  const normalizedTime = hasSeconds ? scheduledTime : `${scheduledTime}:00`;
  return `${agendaId}T${normalizedTime}`;
};

const normalizeAgendaItemCreateInput = (input: AgendaItemCreateInput) => {
  const agendaId = input.agendaId;
  const type = normalizeAgendaItemType(input.type);
  const status = normalizeAgendaItemStatus(input.status);
  const startAt = resolveStartAt(agendaId, input.startAt, input.scheduledTime);
  const duration = input.duration ?? input.durationMinutes ?? undefined;

  return {
    agendaId,
    body: {
      taskId: input.taskId,
      routineTaskId: input.routineTaskId,
      type,
      status,
      startAt,
      duration,
      position: input.position,
      notes: input.notes,
      notificationId: input.notificationId ?? undefined,
    },
  };
};

const agendaItemBasePath = (agendaId: string) => `/agendas/${agendaId}/items`;

export const agendaApi = {
  async getAgendaSummaries(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 50
  ): Promise<AgendaFindAllResponse> {
    return apiClient.request<AgendaFindAllResponse>(
      `/agendas?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`
    );
  },

  async getAgendaItems(params: {
    date: string;
    query?: string;
    mode?: 'all' | 'unfinished';
  }): Promise<AgendaItemsFindAllResponse> {
    const queryParts = [
      `startDate=${params.date}`,
      `endDate=${params.date}`,
    ];

    if (params.query) {
      queryParts.push(`q=${encodeURIComponent(params.query)}`);
    }

    if (params.mode) {
      queryParts.push(`mode=${params.mode}`);
    }

    return apiClient.request<AgendaItemsFindAllResponse>(
      `/agenda-items?${queryParts.join('&')}`
    );
  },

  async getAgendaView(params: {
    mode: AgendaViewMode;
    anchorDate: string;
    timezone: string;
  }): Promise<AgendaViewResponseDto> {
    return apiClient.request<AgendaViewResponseDto>(
      `/agenda-views?mode=${params.mode}&anchorDate=${params.anchorDate}&timezone=${encodeURIComponent(params.timezone)}`
    );
  },

  async createAgendaItem(request: AgendaItemCreateInput): Promise<AgendaItemEnrichedDto> {
    const { agendaId, body } = normalizeAgendaItemCreateInput(request);
    return apiClient.request<AgendaItemEnrichedDto>(agendaItemBasePath(agendaId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },

  async updateAgendaItem(
    agendaId: string,
    id: string,
    request: AgendaItemUpdateRequestDto
  ): Promise<AgendaItemEnrichedDto> {
    return apiClient.request<AgendaItemEnrichedDto>(`${agendaItemBasePath(agendaId)}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteAgendaItem(agendaId: string, id: string): Promise<void> {
    await apiClient.request(`${agendaItemBasePath(agendaId)}/${id}`, { method: 'DELETE' });
  },

  async completeAgendaItem(agendaId: string, id: string): Promise<AgendaItemEnrichedDto> {
    return apiClient.request<AgendaItemEnrichedDto>(`${agendaItemBasePath(agendaId)}/${id}/complete`, {
      method: 'PUT',
    });
  },

  async rescheduleAgendaItem(
    agendaId: string,
    id: string,
    newDate: string,
    newTime: string | null,
    duration: number | null
  ): Promise<AgendaItemEnrichedDto> {
    const startAt = newTime ? `${newDate}T${newTime}:00` : null;
    return apiClient.request<AgendaItemEnrichedDto>(`${agendaItemBasePath(agendaId)}/${id}/reschedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newDate,
        startAt,
        duration,
      }),
    });
  },

  async searchAgendaItems(
    query: string,
    mode: 'all' | 'unfinished',
    date: string
  ): Promise<AgendaItemsFindAllResponse> {
    return agendaApi.getAgendaItems({ query, mode, date });
  },

  async getAgendaItemById(
    agendaId: string,
    id: string
  ): Promise<AgendaItemEnrichedDto | null> {
    return apiClient.requestOrNull<AgendaItemEnrichedDto>(`${agendaItemBasePath(agendaId)}/${id}`);
  },

  async markAsUnfinished(agendaId: string, id: string): Promise<AgendaItemEnrichedDto> {
    return apiClient.request<AgendaItemEnrichedDto>(`${agendaItemBasePath(agendaId)}/${id}/unfinished`, {
      method: 'POST',
    });
  },
};

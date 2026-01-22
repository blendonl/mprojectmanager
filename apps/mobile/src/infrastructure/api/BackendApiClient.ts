import { injectable } from 'tsyringe';
import { API_BASE_URL } from "../../core/config/ApiConfig";

@injectable()
export class BackendApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(this.buildUrl(path), options);

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const data = await response.json();
        if (data?.message) {
          message = data.message;
        }
      } catch {
        // Ignore JSON parse errors.
      }
      throw new Error(message);
    }

    return (await response.json()) as T;
  }

  async requestOrNull<T>(path: string, options?: RequestInit): Promise<T | null> {
    const response = await fetch(this.buildUrl(path), options);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const data = await response.json();
        if (data?.message) {
          message = data.message;
        }
      } catch {
        // Ignore JSON parse errors.
      }
      throw new Error(message);
    }

    return (await response.json()) as T;
  }
}

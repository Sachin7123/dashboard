import type { DashboardSnapshot, TelemetryRequestOptions, TelemetryService } from '../../types/remorph';
import { MockBackend } from './mockBackend';

export class MockTelemetryService implements TelemetryService {
  private readonly backend = new MockBackend();

  async getSnapshot(options?: TelemetryRequestOptions): Promise<DashboardSnapshot> {
    return this.backend.fetchTelemetry(options);
  }
}

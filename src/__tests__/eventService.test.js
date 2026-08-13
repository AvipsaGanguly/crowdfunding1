import { describe, it, expect, vi } from 'vitest';
import { fetchRecentEvents } from '../services/eventService';
import { server } from '../services/contract';

vi.mock('../services/contract', () => ({
  server: {
    getEvents: vi.fn(),
  },
}));

describe('eventService', () => {
  it('returns empty events list when server returns no events', async () => {
    server.getEvents.mockResolvedValueOnce({
      events: [],
      latestLedger: 100,
    });

    const result = await fetchRecentEvents(90);
    expect(result.events).toEqual([]);
    expect(result.latestLedger).toBe(100);
  });

  it('handles server errors gracefully', async () => {
    server.getEvents.mockRejectedValueOnce(new Error('RPC Timeout'));

    const result = await fetchRecentEvents(50);
    expect(result.events).toEqual([]);
    expect(result.latestLedger).toBe(50);
  });
});

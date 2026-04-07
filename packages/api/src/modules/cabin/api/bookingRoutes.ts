import type { FastifyInstance } from 'fastify';
import { BookingRepository } from '../infrastructure/BookingRepository.js';
import { authenticate } from '../../../plugins/authenticate.js';

const repo = new BookingRepository();

export async function bookingRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // ── Availability Windows ────────────────────────────────────

  app.get<{ Params: { id: string } }>('/:id/availability', async (req, reply) => {
    const isOwner = await repo.isOwner(req.params.id, req.user!.id);
    const isInvited = await repo.isInvited(req.params.id, req.user!.email!);
    if (!isOwner && !isInvited) return reply.forbidden();
    const windows = await repo.listAvailability(req.params.id);
    return reply.send({ success: true, data: windows });
  });

  app.post<{ Params: { id: string }; Body: { startDate: string; endDate: string; notes?: string } }>(
    '/:id/availability',
    async (req, reply) => {
      if (!await repo.isOwner(req.params.id, req.user!.id)) return reply.forbidden();
      const window = await repo.createWindow(req.params.id, req.body);
      return reply.status(201).send({ success: true, data: window });
    }
  );

  app.delete<{ Params: { id: string; windowId: string } }>(
    '/:id/availability/:windowId',
    async (req, reply) => {
      if (!await repo.isOwner(req.params.id, req.user!.id)) return reply.forbidden();
      await repo.deleteWindow(req.params.windowId, req.params.id);
      return reply.status(204).send();
    }
  );

  // ── Bookings ────────────────────────────────────────────────

  app.get<{ Params: { id: string } }>('/:id/bookings', async (req, reply) => {
    const isOwner = await repo.isOwner(req.params.id, req.user!.id);
    const isInvited = await repo.isInvited(req.params.id, req.user!.email!);
    if (!isOwner && !isInvited) return reply.forbidden();
    const bookings = await repo.listBookings(req.params.id);
    return reply.send({ success: true, data: bookings });
  });

  app.post<{ Params: { id: string }; Body: { startDate: string; endDate: string; notes?: string } }>(
    '/:id/bookings',
    async (req, reply) => {
      const isOwner = await repo.isOwner(req.params.id, req.user!.id);
      const isInvited = await repo.isInvited(req.params.id, req.user!.email!);
      if (!isOwner && !isInvited) return reply.forbidden();
      try {
        const booking = await repo.createBooking(req.params.id, req.user!.id, req.body);
        return reply.status(201).send({ success: true, data: booking });
      } catch (e) {
        return reply.badRequest(e instanceof Error ? e.message : 'Booking failed');
      }
    }
  );

  app.delete<{ Params: { id: string; bookingId: string } }>(
    '/:id/bookings/:bookingId',
    async (req, reply) => {
      const isOwner = await repo.isOwner(req.params.id, req.user!.id);
      await repo.cancelBooking(req.params.bookingId, req.user!.id, isOwner);
      return reply.status(204).send();
    }
  );

  // ── Invites ─────────────────────────────────────────────────

  app.get<{ Params: { id: string } }>('/:id/invites', async (req, reply) => {
    if (!await repo.isOwner(req.params.id, req.user!.id)) return reply.forbidden();
    const invites = await repo.listInvites(req.params.id);
    return reply.send({ success: true, data: invites });
  });

  app.post<{ Params: { id: string }; Body: { email: string } }>(
    '/:id/invites',
    async (req, reply) => {
      if (!await repo.isOwner(req.params.id, req.user!.id)) return reply.forbidden();
      const invite = await repo.createInvite(req.params.id, req.user!.id, req.body.email.toLowerCase().trim());
      return reply.status(201).send({ success: true, data: invite });
    }
  );

  app.delete<{ Params: { id: string; inviteId: string } }>(
    '/:id/invites/:inviteId',
    async (req, reply) => {
      if (!await repo.isOwner(req.params.id, req.user!.id)) return reply.forbidden();
      await repo.deleteInvite(req.params.inviteId, req.params.id);
      return reply.status(204).send();
    }
  );
}

import type { FastifyInstance } from 'fastify';
import { GroceryRepository } from '../infrastructure/GroceryRepository.js';
import { authenticate } from '../../../plugins/authenticate.js';
import type { OrderItem } from '@cabinconnect/shared';

const repo = new GroceryRepository();

export async function groceryRoutes(app: FastifyInstance) {
  // All routes require auth
  app.addHook('preHandler', authenticate);

  // GET /api/v1/orders/mine
  app.get('/mine', async (req, reply) => {
    const orders = await repo.listByUser(req.user!.id);
    return reply.send({ success: true, data: orders });
  });

  // GET /api/v1/orders/volunteer — available for volunteer pickup
  app.get('/volunteer', async (req, reply) => {
    const orders = await repo.listAvailableForVolunteers();
    return reply.send({ success: true, data: orders });
  });

  // GET /api/v1/orders/:id
  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const order = await repo.findById(req.params.id);
    if (!order) return reply.notFound('Order not found');
    return reply.send({ success: true, data: order });
  });

  // POST /api/v1/orders — create draft
  app.post<{ Body: Omit<import('@cabinconnect/shared').GroceryOrder, 'id' | 'userId' | 'userName' | 'status' | 'volunteerId' | 'volunteerName' | 'createdAt' | 'updatedAt'> }>(
    '/',
    async (req, reply) => {
      const order = await repo.create(req.user!.id, req.body);
      return reply.status(201).send({ success: true, data: order });
    }
  );

  // PATCH /api/v1/orders/:id/items — update shopping list (draft only)
  app.patch<{ Params: { id: string }; Body: { items: OrderItem[] } }>(
    '/:id/items',
    async (req, reply) => {
      const order = await repo.updateItems(req.params.id, req.user!.id, req.body.items);
      return reply.send({ success: true, data: order });
    }
  );

  // POST /api/v1/orders/:id/submit — send to supermarket + open for volunteers
  app.post<{ Params: { id: string } }>('/:id/submit', async (req, reply) => {
    const order = await repo.submit(req.params.id, req.user!.id);
    return reply.send({ success: true, data: order });
  });

  // POST /api/v1/orders/:id/volunteer — volunteer accepts delivery
  app.post<{ Params: { id: string } }>('/:id/volunteer', async (req, reply) => {
    const order = await repo.acceptAsVolunteer(req.params.id, req.user!.id);
    return reply.send({ success: true, data: order });
  });

  // PATCH /api/v1/orders/:id/status — volunteer updates delivery progress
  app.patch<{ Params: { id: string }; Body: { status: 'out_for_delivery' | 'delivered' } }>(
    '/:id/status',
    async (req, reply) => {
      await repo.updateStatus(req.params.id, req.user!.id, req.body.status);
      return reply.send({ success: true });
    }
  );

  // DELETE /api/v1/orders/:id — cancel (draft or submitted only)
  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    await repo.cancel(req.params.id, req.user!.id);
    return reply.status(204).send();
  });
}

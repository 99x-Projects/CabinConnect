import type { FastifyInstance } from 'fastify';
import { CabinRepository } from '../infrastructure/CabinRepository.js';
import { authenticate } from '../../../plugins/authenticate.js';
import type { Cabin, MaintenanceRecord, OwnershipCost, VisitorInstructions } from '@cabinconnect/shared';

const repo = new CabinRepository();

export async function cabinRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // ── Cabins ──────────────────────────────────────────────

  app.get('/', async (req, reply) => {
    const cabins = await repo.listByOwner(req.user!.id);
    return reply.send({ success: true, data: cabins });
  });

  app.post<{ Body: Omit<Cabin, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> }>(
    '/',
    async (req, reply) => {
      const cabin = await repo.create(req.user!.id, req.body);
      return reply.status(201).send({ success: true, data: cabin });
    }
  );

  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const cabin = await repo.findById(req.params.id, req.user!.id);
    if (!cabin) return reply.notFound('Cabin not found');
    return reply.send({ success: true, data: cabin });
  });

  app.patch<{ Params: { id: string }; Body: Partial<Cabin> }>(
    '/:id',
    async (req, reply) => {
      const cabin = await repo.update(req.params.id, req.user!.id, req.body);
      return reply.send({ success: true, data: cabin });
    }
  );

  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    await repo.delete(req.params.id, req.user!.id);
    return reply.status(204).send();
  });

  // ── Maintenance ─────────────────────────────────────────

  app.get<{ Params: { id: string } }>('/:id/maintenance', async (req, reply) => {
    const records = await repo.listMaintenance(req.params.id);
    return reply.send({ success: true, data: records });
  });

  app.post<{ Params: { id: string }; Body: Omit<MaintenanceRecord, 'id' | 'cabinId' | 'createdAt'> }>(
    '/:id/maintenance',
    async (req, reply) => {
      const record = await repo.addMaintenance(req.params.id, req.body);
      return reply.status(201).send({ success: true, data: record });
    }
  );

  app.patch<{ Params: { id: string; recordId: string }; Body: Partial<MaintenanceRecord> }>(
    '/:id/maintenance/:recordId',
    async (req, reply) => {
      const record = await repo.updateMaintenance(req.params.recordId, req.params.id, req.body);
      return reply.send({ success: true, data: record });
    }
  );

  app.delete<{ Params: { id: string; recordId: string } }>(
    '/:id/maintenance/:recordId',
    async (req, reply) => {
      await repo.deleteMaintenance(req.params.recordId, req.params.id);
      return reply.status(204).send();
    }
  );

  // ── Ownership Costs ──────────────────────────────────────

  app.get<{ Params: { id: string } }>('/:id/costs', async (req, reply) => {
    const costs = await repo.listCosts(req.params.id);
    const summary = repo.computeCostSummary(costs);
    return reply.send({ success: true, data: costs, summary });
  });

  app.post<{ Params: { id: string }; Body: Omit<OwnershipCost, 'id' | 'cabinId' | 'createdAt'> }>(
    '/:id/costs',
    async (req, reply) => {
      const cost = await repo.addCost(req.params.id, req.body);
      return reply.status(201).send({ success: true, data: cost });
    }
  );

  app.delete<{ Params: { id: string; costId: string } }>(
    '/:id/costs/:costId',
    async (req, reply) => {
      await repo.deleteCost(req.params.costId, req.params.id);
      return reply.status(204).send();
    }
  );

  // ── Visitor Instructions ─────────────────────────────────

  app.get<{ Params: { id: string } }>('/:id/instructions', async (req, reply) => {
    const instructions = await repo.getInstructions(req.params.id);
    return reply.send({ success: true, data: instructions });
  });

  app.put<{ Params: { id: string }; Body: Omit<VisitorInstructions, 'id' | 'cabinId' | 'updatedAt'> }>(
    '/:id/instructions',
    async (req, reply) => {
      const instructions = await repo.upsertInstructions(req.params.id, req.body);
      return reply.send({ success: true, data: instructions });
    }
  );
}

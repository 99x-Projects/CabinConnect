import type { FastifyInstance } from 'fastify';
import { SupplierRepository } from '../infrastructure/SupplierRepository.js';
import { ReviewRepository } from '../infrastructure/ReviewRepository.js';
import { authenticate } from '../../../plugins/authenticate.js';
import type { SupplierSearchParams } from '@cabinconnect/shared';

const repo = new SupplierRepository();
const reviewRepo = new ReviewRepository();

export async function supplierRoutes(app: FastifyInstance) {
  // GET /api/v1/suppliers — search with geo/resort/category filters
  app.get<{ Querystring: SupplierSearchParams }>('/', async (req, reply) => {
    const params: SupplierSearchParams = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 100),
      category: req.query.category,
      resort: req.query.resort,
      lat: req.query.lat !== undefined ? Number(req.query.lat) : undefined,
      lng: req.query.lng !== undefined ? Number(req.query.lng) : undefined,
      radiusKm: req.query.radiusKm !== undefined ? Number(req.query.radiusKm) : undefined,
    };
    const result = await repo.search(params);
    return reply.send({ success: true, ...result });
  });

  // GET /api/v1/suppliers/:id — supplier detail with reviews
  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const supplier = await repo.findById(req.params.id);
    if (!supplier) return reply.notFound('Supplier not found');
    return reply.send({ success: true, data: supplier });
  });

  // POST /api/v1/suppliers — nominate a new supplier
  app.post<{ Body: Parameters<typeof repo.create>[0] }>('/', async (req, reply) => {
    const supplier = await repo.create(req.body);
    return reply.status(201).send({ success: true, data: supplier });
  });

  // PATCH /api/v1/suppliers/:id/status — admin approve/reject
  app.patch<{ Params: { id: string }; Body: { status: 'approved' | 'rejected' } }>(
    '/:id/status',
    async (req, reply) => {
      await repo.updateStatus(req.params.id, req.body.status);
      return reply.send({ success: true });
    }
  );

  // POST /api/v1/suppliers/:id/reviews — submit review (auth, 1 per user)
  app.post<{ Params: { id: string }; Body: { rating: number; comment: string; jobDate?: string } }>(
    '/:id/reviews',
    { preHandler: authenticate },
    async (req, reply) => {
      const already = await reviewRepo.hasReviewed(req.params.id, req.user!.id);
      if (already) return reply.status(409).send({ success: false, error: 'Already reviewed' });
      const review = await reviewRepo.create({
        supplierId: req.params.id,
        userId: req.user!.id,
        rating: req.body.rating as 1 | 2 | 3 | 4 | 5,
        comment: req.body.comment,
        jobDate: req.body.jobDate,
      });
      return reply.status(201).send({ success: true, data: review });
    }
  );

  // POST /api/v1/reviews/:reviewId/reply — claimed supplier replies
  app.post<{ Params: { reviewId: string }; Body: { supplierId: string; comment: string } }>(
    '/reviews/:reviewId/reply',
    { preHandler: authenticate },
    async (req, reply) => {
      const reply_ = await reviewRepo.addReply(req.params.reviewId, req.body.supplierId, req.body.comment);
      return reply.status(201).send({ success: true, data: reply_ });
    }
  );

  // POST /api/v1/suppliers/:id/claim — supplier claims profile
  app.post<{ Params: { id: string }; Body: { userId: string } }>(
    '/:id/claim',
    async (req, reply) => {
      await repo.claim(req.params.id, req.body.userId);
      return reply.send({ success: true });
    }
  );
}

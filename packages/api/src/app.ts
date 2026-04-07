import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { supplierRoutes } from './modules/directory/api/supplierRoutes.js';
import { profileRoutes } from './modules/identity/api/profileRoutes.js';
import { cabinRoutes } from './modules/cabin/api/cabinRoutes.js';
import { eventRoutes } from './modules/community/api/eventRoutes.js';
import { toolRoutes } from './modules/sharing/api/toolRoutes.js';
import { groceryRoutes } from './modules/commerce/api/groceryRoutes.js';
import { bookingRoutes } from './modules/cabin/api/bookingRoutes.js';

export async function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  await app.register(cors, { origin: process.env.CORS_ORIGIN || '*' });
  await app.register(sensible);

  // Health check
  app.get('/health', async () => ({ status: 'ok' }));

  // Identity routes (prefix-less — /api/v1/me, /api/v1/users/:id/role)
  await app.register(profileRoutes, { prefix: '/api/v1' });

  // Module routes
  await app.register(supplierRoutes, { prefix: '/api/v1/suppliers' });
  await app.register(cabinRoutes, { prefix: '/api/v1/cabins' });
  await app.register(eventRoutes, { prefix: '/api/v1/events' });
  await app.register(toolRoutes, { prefix: '/api/v1/tools' });
  await app.register(groceryRoutes, { prefix: '/api/v1/orders' });
  await app.register(bookingRoutes, { prefix: '/api/v1/cabins' });

  return app;
}

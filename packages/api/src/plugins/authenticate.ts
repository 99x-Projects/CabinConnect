import type { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ success: false, error: 'Missing bearer token' });
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return reply.status(401).send({ success: false, error: 'Invalid or expired token' });
  }

  req.user = { id: data.user.id, email: data.user.email ?? '' };
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  await authenticate(req, reply);
  if (reply.sent) return;

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', req.user!.id)
    .single();

  if (data?.role !== 'admin') {
    return reply.status(403).send({ success: false, error: 'Admin access required' });
  }
}

// Augment FastifyRequest to carry user
declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string; email: string };
  }
}

import { AbstractState } from './abstract-state'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export type StateConstructor<T extends AbstractState<any, any> = AbstractState<any, any>> = new (
  fastify: FastifyInstance,
  req: FastifyRequest<{
    Body?: unknown
    Params?: unknown
    Headers?: unknown
    Querystring?: unknown
  }>,
  reply: FastifyReply
) => T

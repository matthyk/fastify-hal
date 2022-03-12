import { AbstractState } from './abstract-state'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { IModel } from '../model'

export type StateConstructor<
  Model extends IModel,
  Request,
  T extends AbstractState<Model, Request> = AbstractState<Model, Request>
> = new (fastify: FastifyInstance, req: FastifyRequest<Request>, reply: FastifyReply) => T

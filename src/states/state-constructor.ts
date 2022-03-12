import { AbstractState } from './abstract-state'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { IModel } from '../model'
import { RequestModel } from './request-model'

export type StateConstructor<
  Model extends IModel,
  Request extends RequestModel,
  T extends AbstractState<Model, Request> = AbstractState<Model, Request>
> = new (fastify: FastifyInstance, req: FastifyRequest<Request>, reply: FastifyReply) => T

import { FastifyInstance, HTTPMethods, RouteOptions } from 'fastify'
import {
  AbstractConditionalDeleteState,
  AbstractDeleteState,
  RequestModel,
  StateConstructor,
} from '../../states'
import deepmerge from 'deepmerge'
import { IModel } from '../../model'

export function deleteState<
  M extends IModel,
  R extends RequestModel,
  T extends AbstractDeleteState<M, R>
>(
  this: FastifyInstance,
  routeOptions: Omit<RouteOptions, 'handler' | 'method'>,
  stateConstructor: StateConstructor<M, R, T>
): FastifyInstance {
  const opts = {
    method: 'DELETE' as HTTPMethods,
    schema: {
      response: {},
    },
  }

  return this.state(deepmerge(opts, routeOptions), stateConstructor)
}

export function conditionalDeleteState<
  M extends IModel,
  R extends RequestModel,
  T extends AbstractConditionalDeleteState<M, R>
>(
  this: FastifyInstance,
  routeOptions: Omit<RouteOptions, 'handler' | 'method'>,
  stateConstructor: StateConstructor<M, R, T>
): FastifyInstance {
  const opts = {
    method: 'DELETE' as HTTPMethods,
    schema: {
      headers: {
        type: 'object',
        properties: {
          'If-match': {
            type: 'string',
          },
        },
      },
      response: {},
    },
  }

  return this.state(deepmerge(opts, routeOptions), stateConstructor)
}

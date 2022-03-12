import { FastifyInstance, HTTPMethods, RouteOptions } from 'fastify'
import {
  AbstractConditionalPutState,
  AbstractPutState,
  RequestModel,
  StateConstructor,
} from '../../states'
import deepmerge from 'deepmerge'
import { IModel } from '../../model'

export function putState<
  M extends IModel,
  R extends RequestModel,
  T extends AbstractPutState<M, R>
>(
  this: FastifyInstance,
  routeOptions: Omit<RouteOptions, 'handler' | 'method'>,
  stateConstructor: StateConstructor<M, R, T>
): FastifyInstance {
  const opts = {
    method: 'PUT' as HTTPMethods,
    schema: {
      response: {},
    },
  }

  return this.state(deepmerge(opts, routeOptions), stateConstructor)
}

export function conditionalPutState<
  M extends IModel,
  R extends RequestModel,
  T extends AbstractConditionalPutState<M, R>
>(
  this: FastifyInstance,
  routeOptions: Omit<RouteOptions, 'handler' | 'method'>,
  stateConstructor: StateConstructor<M, R, T>
): FastifyInstance {
  const opts = {
    method: 'PUT' as HTTPMethods,
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

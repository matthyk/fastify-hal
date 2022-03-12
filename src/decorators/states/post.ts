import { FastifyInstance, HTTPMethods, RouteOptions } from 'fastify'
import { AbstractPostState, RequestModel, StateConstructor } from '../../states'
import deepmerge from 'deepmerge'
import { IModel } from '../../model'

export function postState<
  M extends IModel,
  R extends RequestModel,
  T extends AbstractPostState<M, R>
>(
  this: FastifyInstance,
  routeOptions: Omit<RouteOptions, 'handler' | 'method'>,
  stateConstructor: StateConstructor<M, R, T>
): FastifyInstance {
  const opts = {
    method: 'POST' as HTTPMethods,
    schema: {
      response: {
        201: {
          headers: {
            Location: {
              description: 'Location of the created resource.',
              schema: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  }

  return this.state(deepmerge(opts, routeOptions), stateConstructor)
}

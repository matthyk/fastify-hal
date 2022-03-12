import { FastifyInstance, HTTPMethods, RouteOptions } from 'fastify'
import {
  AbstractGetCollectionStateWithOffsetSize,
  AbstractGetState,
  RequestModel,
  StateConstructor,
} from '../../states'
import deepmerge from 'deepmerge'
import { IModel } from '../../model'

export function getState<
  M extends IModel,
  R extends RequestModel,
  T extends AbstractGetState<M, R>
>(
  this: FastifyInstance,
  routeOptions: Omit<RouteOptions, 'handler' | 'method'>,
  stateConstructor: StateConstructor<M, R, T>
): FastifyInstance {
  const opts = {
    method: 'GET' as HTTPMethods,
    schema: {
      headers: {
        'If-None-Match': {
          type: 'string',
        },
      },
      response: {
        304: {
          type: 'null',
        },
        200: {
          type: 'object',
          properties: {
            _links: {
              type: 'object',
              properties: {
                self: {
                  $ref: 'HalLink#',
                },
              },
            },
          },
          headers: {
            'Cache-Control': {
              description: 'Cache-Control',
              schema: {
                type: 'string',
              },
            },
            ETag: {
              description: 'ETag',
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

export function getCollectionWithOffsetSizeState<
  M extends IModel,
  R extends RequestModel,
  T extends AbstractGetCollectionStateWithOffsetSize<M, R>
>(
  this: FastifyInstance,
  routeOptions: Omit<RouteOptions, 'handler' | 'method'>,
  stateConstructor: StateConstructor<M, R, T>
): FastifyInstance {
  const opts = {
    method: 'GET' as HTTPMethods,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          offset: {
            type: 'integer',
            default: this.pluginOptions.pagination.defaultOffset,
          },
          size: {
            type: 'integer',
            default: this.pluginOptions.pagination.defaultSize,
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            _links: {
              self: {
                $ref: 'HalLink#',
              },
            },
            totalCount: {
              type: 'integer',
            },
          },
          headers: {
            'Cache-Control': {
              description: 'Cache-Control',
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

import { FastifyInstance, HTTPMethods, RouteOptions } from 'fastify'
import {
  AbstractGetCollectionStateWithOffsetSize,
  AbstractGetState,
  StateConstructor,
} from '../../states'
import deepmerge from 'deepmerge'

export function getState(
  this: FastifyInstance,
  routeOptions: Omit<RouteOptions, 'handler' | 'method'>,
  stateConstructor: StateConstructor<AbstractGetState<any, any>>
): FastifyInstance {
  return this.state(
    deepmerge(
      {
        method: 'GET' as HTTPMethods,
        schema: {
          response: {
            304: {
              type: 'null',
            },
            200: {
              type: 'object',
              properties: {
                id: {
                  type: ['string', 'integer'],
                },
                _links: {
                  type: 'object',
                  additionalProperties: {
                    $ref: 'HalLinks#',
                  },
                },
                _embedded: {
                  type: 'object',
                  additionalProperties: {
                    $ref: 'ResourceObjects#',
                  },
                },
              },
            },
          },
        },
      },
      routeOptions
    ),
    stateConstructor
  )
}

export function getCollectionWithOffsetSizeState(
  this: FastifyInstance,
  routeOptions: Omit<RouteOptions, 'handler' | 'method'>,
  stateConstructor: StateConstructor<AbstractGetCollectionStateWithOffsetSize<any, any>>
): FastifyInstance {
  return this.state(
    deepmerge(
      {
        method: 'GET' as HTTPMethods,
        schema: {
          querystring: {
            type: 'object',
            properties: {
              offset: {
                type: 'integer',
                default: 0,
              },
              size: {
                type: 'integer',
                default: 10,
              },
            },
          },
          response: {
            200: {
              type: 'object',
              properties: {
                additionalProperties: {
                  type: {
                    $ref: 'HalLink#',
                  },
                },
                _links: {
                  type: 'object',
                  properties: {
                    self: {
                      $ref: 'HalLink#',
                    },
                    first: {
                      $ref: 'HalLink#',
                    },
                    prev: {
                      $ref: 'HalLink#',
                    },
                    next: {
                      $ref: 'HalLink#',
                    },
                    last: {
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
              },
            },
          },
        },
      },
      routeOptions
    ),
    stateConstructor
  )
}

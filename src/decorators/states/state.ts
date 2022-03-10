import { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from 'fastify'
import { AbstractState, StateConstructor } from '../../plugin'
import deepmerge from 'deepmerge'

export function state(
  this: FastifyInstance,
  routeOptions: RouteOptions,
  stateConstructor: StateConstructor
): FastifyInstance {
  routeOptions.handler = async function (request: FastifyRequest, reply: FastifyReply) {
    const state: AbstractState<any, any> = new stateConstructor(this, request, reply)

    await state.build()
  }

  return this.route(
    deepmerge(
      {
        schema: {
          response: {
            400: {
              description:
                "The request was not processed due to an malformed request body. See 'message' property for details.",
              $ref: 'Error#',
            },
            401: {
              description: 'Authorization information is missing or invalid.',
              $ref: 'Error#',
            },
            403: {
              description: 'Missing permissions to create this resource.',
              $ref: 'Error#',
            },
            500: {
              description: 'An internal server error has occurred.',
              $ref: 'Error#',
            },
          },
        },
      },
      routeOptions
    )
  )
}

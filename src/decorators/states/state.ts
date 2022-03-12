import { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from 'fastify'
import { AbstractState, IModel, RequestModel, StateConstructor } from '../..'
import deepmerge from 'deepmerge'

export function state<M extends IModel, R extends RequestModel, T extends AbstractState<M, R>>(
  this: FastifyInstance,
  routeOptions: RouteOptions<any, any, any, R>,
  stateConstructor: StateConstructor<M, R, T>
): FastifyInstance {
  if (this.pluginOptions.useJsonStringify) {
    routeOptions.serializerCompiler = () => JSON.stringify
  }

  if (
    this.pluginOptions.resolveTypeBoxObject &&
    routeOptions?.schema &&
    'properties' in routeOptions.schema
  ) {
    const schemaKeys = ['body', 'querystring', 'headers', 'params']

    for (let i = 0; i < schemaKeys.length; i++) {
      const property = (routeOptions.schema as any).properties[schemaKeys[i]]
      if (property) {
        // @ts-ignore FIXME
        routeOptions.schema[schemaKeys[i]] = deepmerge(
          routeOptions.schema[schemaKeys[i]],
          property.properties
        )
      }
    }

    delete routeOptions.schema['kind']
    delete routeOptions.schema['properties']
    delete routeOptions.schema['required']
  }

  routeOptions.handler = async function (request: FastifyRequest<R>, reply: FastifyReply) {
    const state = new stateConstructor(this, request, reply)

    await state.build()
  }

  return this.route(
    deepmerge(
      {
        schema: {
          response: {
            400: {
              description:
                'The request was not processed due to an malformed request body. See "message" property for details.',
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

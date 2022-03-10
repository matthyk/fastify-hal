import fp from 'fastify-plugin'
import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import {
  absoluteUrl,
  baseUrl,
  evaluatePreconditions,
  fillInPlaceholder,
  fullUrl,
  getCollectionWithOffsetSizeState,
  getState,
  state,
} from './decorators'
import {
  errorSchema,
  halLinkSchema,
  halLinksSchema,
  resourceObjectSchema,
  resourceObjectsSchema,
} from './schemas'

export interface FastifyHalPluginOptions {
  baseUrl?: string
  activateHypertextCachePattern?: boolean
}

const httpful: FastifyPluginAsync<FastifyHalPluginOptions> = async (
  fastify: FastifyInstance,
  opts: FastifyHalPluginOptions
) => {
  if (!(typeof opts.baseUrl === 'undefined')) {
    if (opts.baseUrl.charAt(opts.baseUrl.length - 1) === '/') {
      if (opts.baseUrl.charAt(opts.baseUrl.length - 2) === '/') {
        throw new Error('Please provide a validBase url. Url should end with single "/".')
      }
    } else {
      fastify.log.debug('Append "/" to baseUrl.')
      opts.baseUrl = opts.baseUrl + '/'
    }
  }

  // Schemas
  fastify.addSchema(errorSchema)
  fastify.addSchema(halLinkSchema)
  fastify.addSchema(halLinksSchema)
  fastify.addSchema(resourceObjectSchema)
  fastify.addSchema(resourceObjectsSchema)

  // State decorators
  fastify.decorate('state', state)
  fastify.decorate('getCollectionWithOffsetSizeState', getCollectionWithOffsetSizeState)
  fastify.decorate('getState', getState)

  // Constants
  fastify.decorate('activateHypertextCachePattern', opts.activateHypertextCachePattern ?? true)
  fastify.decorate('baseUrl', opts.baseUrl)

  // Request decorators
  fastify.decorateRequest('evaluatePreconditions', evaluatePreconditions)
  fastify.decorateRequest('fullUrl', fullUrl)
  fastify.decorateRequest('baseUrl', baseUrl)
  fastify.decorateRequest('absoluteUrl', absoluteUrl)

  // Fastify Instance decorators
  fastify.decorate('fillInPlaceholder', fillInPlaceholder)
}

export * from './states'
export * from './pagination'
export * from './model'
export default fp(httpful, {
  fastify: '3.x',
  name: 'fastify-hal',
  dependencies: ['fastify-sensible'],
})

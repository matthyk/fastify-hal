import fp from 'fastify-plugin'
import { FastifyInstance, FastifyPluginAsync, RouteOptions } from 'fastify'
import {
  absoluteUrl,
  baseUrl,
  conditionalDeleteState,
  conditionalPutState,
  deleteState,
  evaluatePreconditions,
  fillInPlaceholder,
  fullUrl,
  getCollectionWithOffsetSizeState,
  getState,
  postState,
  putState,
  state,
} from './decorators'
import { errorSchema, halLinkSchema } from './schemas'
import {
  AbstractConditionalDeleteState,
  AbstractConditionalPutState,
  AbstractDeleteState,
  AbstractGetCollectionStateWithOffsetSize,
  AbstractGetState,
  AbstractPostState,
  AbstractPutState,
  AbstractState,
  RequestModel,
  StateConstructor,
} from './states'
import { IModel } from './model'

declare module 'fastify' {
  export interface FastifyRequest {
    evaluatePreconditions(lastModifiedAt: number, etag: string): boolean

    baseUrl(): string

    fullUrl(): string

    absoluteUrl(url: string): string
  }

  export interface FastifyInstance {
    pluginOptions: {
      activateHypertextCachePattern: boolean
      useJsonStringify: boolean
      resolveTypeBoxObject: boolean
      pagination: {
        defaultSize: number
        defaultOffset: number
      }
    }

    baseUrl?: string

    fillInPlaceholder(pattern: string, data: Record<string, any>): string

    state<M extends IModel, R, T extends AbstractState<M, R>>(
      opts: Omit<RouteOptions, 'handler'>,
      state: StateConstructor<M, R, T>
    ): FastifyInstance

    getCollectionWithOffsetSizeState<
      M extends IModel,
      R,
      T extends AbstractGetCollectionStateWithOffsetSize<any, any>
    >(
      opts: Omit<RouteOptions, 'handler' | 'method'>,
      state: StateConstructor<M, R, T>
    ): FastifyInstance

    getState<M extends IModel, R extends RequestModel, T extends AbstractGetState<M, R>>(
      opts: Omit<RouteOptions, 'handler' | 'method'>,
      state: StateConstructor<M, R, T>
    ): FastifyInstance

    postState<M extends IModel, R extends RequestModel, T extends AbstractPostState<M, R>>(
      opts: Omit<RouteOptions, 'handler' | 'method'>,
      state: StateConstructor<M, R, T>
    ): FastifyInstance

    deleteState<M extends IModel, R extends RequestModel, T extends AbstractDeleteState<M, R>>(
      opts: Omit<RouteOptions, 'handler' | 'method'>,
      state: StateConstructor<M, R, T>
    ): FastifyInstance

    conditionalDeleteState<
      M extends IModel,
      R extends RequestModel,
      T extends AbstractConditionalDeleteState<M, R>
    >(
      opts: Omit<RouteOptions, 'handler' | 'method'>,
      state: StateConstructor<M, R, T>
    ): FastifyInstance

    putState<M extends IModel, R extends RequestModel, T extends AbstractPutState<M, R>>(
      opts: Omit<RouteOptions, 'handler' | 'method'>,
      state: StateConstructor<M, R, T>
    ): FastifyInstance

    conditionalPutState<
      M extends IModel,
      R extends RequestModel,
      T extends AbstractConditionalPutState<M, R>
    >(
      opts: Omit<RouteOptions, 'handler' | 'method'>,
      state: StateConstructor<M, R, T>
    ): FastifyInstance
  }
}

export interface PaginationOptions {
  defaultSize?: number
  defaultOffset?: number
}

export interface FastifyHalPluginOptions {
  baseUrl?: string
  activateHypertextCachePattern?: boolean
  useJsonStringify?: boolean
  paginationOptions?: PaginationOptions
  resolveTypeBoxObject?: boolean
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

  opts.activateHypertextCachePattern = opts.activateHypertextCachePattern ?? true
  opts.useJsonStringify = opts.useJsonStringify ?? true
  opts.resolveTypeBoxObject = opts.resolveTypeBoxObject ?? false
  opts.paginationOptions = opts.paginationOptions ?? {}
  opts.paginationOptions.defaultSize = opts.paginationOptions.defaultSize ?? 10
  opts.paginationOptions.defaultOffset = opts.paginationOptions.defaultOffset ?? 10

  // Schemas
  fastify.addSchema(errorSchema)
  fastify.addSchema(halLinkSchema)

  // State decorators
  fastify.decorate('state', state)
  fastify.decorate('getCollectionWithOffsetSizeState', getCollectionWithOffsetSizeState)
  fastify.decorate('getState', getState)
  fastify.decorate('postState', postState)
  fastify.decorate('putState', putState)
  fastify.decorate('conditionalPutState', conditionalPutState)
  fastify.decorate('deleteState', deleteState)
  fastify.decorate('conditionalDeleteState', conditionalDeleteState)

  fastify.decorate<FastifyInstance['pluginOptions']>('pluginOptions', {
    activateHypertextCachePattern: opts.activateHypertextCachePattern,
    useJsonStringify: opts.useJsonStringify,
    resolveTypeBoxObject: opts.resolveTypeBoxObject,
    pagination: {
      defaultSize: opts.paginationOptions.defaultSize,
      defaultOffset: opts.paginationOptions.defaultOffset,
    },
  })
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
export default fp<FastifyHalPluginOptions>(httpful, {
  fastify: '3.x',
  name: 'fastify-hal',
  dependencies: ['fastify-sensible'],
})

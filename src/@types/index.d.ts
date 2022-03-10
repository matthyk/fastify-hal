import { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from 'fastify'
import { AbstractState } from '../plugin/states'
import { StateConstructor } from '../plugin/plugin'
import { AbstractGetCollectionStateWithOffsetSize } from '../plugin/states'
import { AbstractGetState } from '../states'

declare module 'fastify' {
  export interface FastifyRequest {
    evaluatePreconditions(lastModifiedAt: number, etag: string): boolean

    baseUrl(): string

    fullUrl(): string

    absoluteUrl(url: string): string
  }

  export interface FastifyInstance {
    baseUrl?: string
    activateHypertextCachePattern: boolean

    fillInPlaceholder(pattern: string, data: Record<string, any>): string

    state<T extends AbstractState>(
      opts: Omit<RouteOptions, 'handler'>,
      state: StateConstructor<T>
    ): FastifyInstance

    getCollectionWithOffsetSizeState<T extends AbstractGetCollectionStateWithOffsetSize<any, any>>(
      opts: Omit<RouteOptions, 'handler' | 'method'>,
      state: StateConstructor<T>
    ): FastifyInstance

    getState<T extends AbstractGetState<any, any>>(
      opts: Omit<RouteOptions, 'handler' | 'method'>,
      state: StateConstructor<T>
    ): FastifyInstance
  }
}

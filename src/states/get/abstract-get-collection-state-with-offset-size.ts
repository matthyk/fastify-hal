import { IModel } from '../../model'
import { AbstractGetCollectionState } from './abstract-get-collection-state'
import {
  AbstractPagination,
  CollectionResult,
  OffsetSizePagination,
  OffsetSizePage,
} from '../../pagination'
import { FastifyRequest } from 'fastify'
import { RequestModel } from '../request-model'

export abstract class AbstractGetCollectionStateWithOffsetSize<
  Model extends IModel,
  Request extends RequestModel = {}
> extends AbstractGetCollectionState<Model, OffsetSizePage, Request> {
  protected totalCount: number = 0

  protected collectionDatabaseResult: CollectionResult<Model>

  public override readonly req: FastifyRequest<{
    Body: Request['Body'] extends unknown ? Request['body'] : Request['Body']
    Params: Request['Params'] extends unknown ? Request['params'] : Request['Params']
    Headers: Request['Headers'] extends unknown ? Request['headers'] : Request['Headers']
    Querystring: { offset: number; size: number } & (Request['Querystring'] extends unknown
      ? Request['querystring']
      : Request['Querystring'])
  }>

  protected override async loadModelsFromDatabase(): Promise<Model[]> {
    this.collectionDatabaseResult = await this.loadModelsAndTotalCountFromDatabase()

    this.totalCount = this.collectionDatabaseResult.totalCount

    return this.collectionDatabaseResult.results
  }

  protected abstract loadModelsAndTotalCountFromDatabase(): Promise<CollectionResult<Model>>

  protected override definePagination(): AbstractPagination<OffsetSizePage> {
    return new OffsetSizePagination(
      this.collectionDatabaseResult!,
      this.current,
      this.fastify.pluginOptions.pagination.defaultSize,
      this.fastify.pluginOptions.pagination.defaultOffset
    )
  }

  protected override extractCurrent(): OffsetSizePage {
    return {
      offset: +this.req.query.offset ?? this.fastify.pluginOptions.pagination.defaultOffset,
      size: +this.req.query.size ?? this.fastify.pluginOptions.pagination.defaultSize,
    }
  }

  protected getUrlForPaginationLinks(): URL {
    return new URL(this.req.fullUrl())
  }

  protected override createUrl(page: OffsetSizePage): string {
    const url = this.getUrlForPaginationLinks()

    url.searchParams.set('size', page.size.toString())
    url.searchParams.set('offset', page.offset.toString())

    return url.toString()
  }

  protected override definePaginationResponse() {
    super.definePaginationResponse()
    this.defineProperty('totalCount', this.totalCount)
  }
}

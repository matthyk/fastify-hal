import { IModel } from '../../model'
import { AbstractGetCollectionState } from './abstract-get-collection-state'
import {
  AbstractPagination,
  CollectionResult,
  OffsetSizePagination,
  OffsetSizePage,
} from '../../pagination'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export abstract class AbstractGetCollectionStateWithOffsetSize<
  Model extends IModel,
  Request extends { Body?: unknown; Params?: unknown; Headers?: unknown; Querystring?: unknown }
> extends AbstractGetCollectionState<Model, OffsetSizePage, Request> {
  protected totalCount: number = 0

  protected collectionDatabaseResult?: CollectionResult<Model>

  public override readonly req: FastifyRequest<{
    Body: never
    Querystring: { offset: number; size: number } & Request['Querystring']
    Headers: Request['Headers']
    Params: Request['Params']
  }>

  constructor(
    fastify: FastifyInstance,
    req: FastifyRequest<{
      Body: never
      Querystring: { offset: number; size: number } & Request['Querystring']
      Headers: Request['Headers']
      Params: Request['Params']
    }>,
    reply: FastifyReply
  ) {
    super(fastify, req, reply)
    this.req = req
  }

  protected override async loadModelsFromDatabase(): Promise<Model[]> {
    this.collectionDatabaseResult = await this.loadModelsAndTotalCountFromDatabase()

    this.totalCount = this.collectionDatabaseResult.totalCount

    return this.collectionDatabaseResult.results
  }

  protected abstract loadModelsAndTotalCountFromDatabase(): Promise<CollectionResult<Model>>

  protected override definePagination(): AbstractPagination<OffsetSizePage> {
    return new OffsetSizePagination(this.collectionDatabaseResult!, this.current)
  }

  protected override extractCurrent(): OffsetSizePage {
    return {
      offset: +this.req.query.offset ?? 0,
      size: +this.req.query.size ?? 10,
    }
  }

  protected override createUrl(page: OffsetSizePage): string {
    const url = new URL(this.req.fullUrl())

    url.searchParams.set('size', page.size.toString())
    url.searchParams.set('offset', page.offset.toString())

    return url.toString()
  }

  protected override definePaginationResponse() {
    super.definePaginationResponse()
    // @ts-ignore
    this.resourceObject['totalCount'] = this.totalCount
  }
}

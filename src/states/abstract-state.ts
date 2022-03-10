import { FastifyInstance, FastifyLoggerInstance, FastifyReply, FastifyRequest } from 'fastify'
import { bigInt } from '@sindresorhus/fnv1a'
import { EmbeddedObjectBuilder } from '../hal/embedded-object-builder'
import { buildEmbeddedObject } from '../hal/build-embedded'
import { HalLink, ResourceObject } from '../hal/hal-format'
import { EmbeddedArrayBuilder } from '../hal/embedded-array-builder'

export abstract class AbstractState<
  Model,
  Request extends {
    Body?: unknown
    Params?: unknown
    Headers?: unknown
    Querystring?: unknown
  } = {}
> {
  protected static HAL_MEDIA_TYPE: string = 'application/hal+json'

  public readonly fastify: FastifyInstance

  public readonly req: FastifyRequest<{
    Body: Request['Body']
    Params: Request['Params']
    Headers: Request['Headers']
    Querystring: Request['Querystring']
  }>

  public readonly reply: FastifyReply

  protected readonly logger: FastifyLoggerInstance

  protected serialize: (payload: unknown) => string

  protected readonly stateName: string

  protected resourceObject: ResourceObject & Partial<Model>

  constructor(
    fastify: FastifyInstance,
    req: FastifyRequest<{
      Body: Request['Body']
      Params: Request['Params']
      Headers: Request['Headers']
      Querystring: Request['Querystring']
    }>,
    reply: FastifyReply
  ) {
    this.fastify = fastify
    this.req = req
    this.reply = reply
    this.logger = fastify.log
    this.stateName = this.constructor.name
    this.serialize = reply.serialize ? reply.serialize.bind(reply) : JSON.stringify
    this.resourceObject = <ResourceObject & Partial<Model>>{
      _links: {
        self: {
          href: this.getSelfHref(),
        },
      },
      _embedded: {},
    }
    this.reply.type(AbstractState.HAL_MEDIA_TYPE)
  }

  protected preventCaching(): void {
    this.reply.header('Cache-Control', 'no-cache, no-store, must-revalidate')
  }

  // use this method to modify and to add headers for example
  protected defineHttpResponse(): void {}

  protected createEtag(value: unknown): string {
    return bigInt(this.serialize(value), { size: 64 }).toString()
  }

  public info(msg: string): void {
    this.logger.info(`${this.stateName}: ${msg}`)
  }

  public error(msg: string): void {
    this.logger.error(`${this.stateName}: ${msg}`)
  }

  public debug(msg: string): void {
    this.logger.debug(`${this.stateName}: ${msg}`)
  }

  public trace(msg: string): void {
    this.logger.trace(`${this.stateName}: ${msg}`)
  }

  public fatal(msg: string): void {
    this.logger.fatal(`${this.stateName}: ${msg}`)
  }

  public warn(msg: string): void {
    this.logger.warn(`${this.stateName}: ${msg}`)
  }

  abstract build(): Promise<void>

  protected before(): Promise<void> | void {}

  protected getSelfHref(): string {
    return this.req.fullUrl()
  }

  protected defineLinks(): void | Promise<void> {}

  protected defineEmbedded(): void | Promise<void> {}

  protected defineProperties(): void {}

  protected addLink(relationType: string, href: string, opts: Omit<HalLink, 'href'> = {}) {
    this.resourceObject._links[relationType] = {
      href,
      ...opts,
    }
  }

  protected addAbsoluteLink(relationType: string, href: string, opts: Omit<HalLink, 'href'> = {}) {
    this.resourceObject._links[relationType] = {
      href: this.req.absoluteUrl(href),
      ...opts,
    }
  }

  protected addEmbeddedArray<K extends (keyof Model & string) | string, T>(
    relationType: K,
    models: T[],
    build: (builder: EmbeddedArrayBuilder<T, this>) => EmbeddedArrayBuilder<T, this> = (builder) =>
      builder
  ): void {
    this.resourceObject._embedded[relationType] = []

    for (let i = 0; i < models.length; i++) {
      // @ts-ignore
      this.resourceObject._embedded[relationType].push({
        _links: {},
        _embedded: {},
      })
    }

    this.resourceObject._embedded[relationType] = build(
      new EmbeddedArrayBuilder<T, this>(
        models,
        this.resourceObject._embedded[relationType] as ResourceObject[],
        this
      )
    ).resourceObjects
  }

  protected addAbsoluteEmbeddedObject<K extends string, O extends Record<string, any>>(
    relationType: K,
    href: string,
    object: O,
    build: (builder: EmbeddedObjectBuilder<O, this>) => EmbeddedObjectBuilder<O, this>
  ): void
  protected addAbsoluteEmbeddedObject<K extends keyof Model & string>(
    relationType: K,
    href: string,
    build: (builder: EmbeddedObjectBuilder<Model[K], this>) => EmbeddedObjectBuilder<Model[K], this>
  ): void
  protected addAbsoluteEmbeddedObject<
    K extends keyof Model & string,
    O extends Record<string, any>
  >(
    relationType: K,
    href: string,
    buildOrObject:
      | ((builder: EmbeddedObjectBuilder<Model[K], this>) => EmbeddedObjectBuilder<Model[K], this>)
      | O,
    build?: (builder: EmbeddedObjectBuilder<O, this>) => EmbeddedObjectBuilder<O, this>
  ): void {
    // @ts-ignore
    this.addEmbeddedObject(relationType, this.req.absoluteUrl(href), buildOrObject, build)
  }

  protected addEmbeddedObject<K extends string, O extends Record<string, any>>(
    relationType: K,
    href: string,
    object: O,
    build: (builder: EmbeddedObjectBuilder<O, this>) => EmbeddedObjectBuilder<O, this>
  ): void
  protected addEmbeddedObject<K extends keyof Model & string>(
    relationType: K,
    href: string,
    build: (builder: EmbeddedObjectBuilder<Model[K], this>) => EmbeddedObjectBuilder<Model[K], this>
  ): void
  protected addEmbeddedObject<K extends keyof Model & string, O extends Record<string, any>>(
    relationType: K,
    href: string,
    buildOrObject:
      | ((builder: EmbeddedObjectBuilder<Model[K], this>) => EmbeddedObjectBuilder<Model[K], this>)
      | O,
    build?: (builder: EmbeddedObjectBuilder<O, this>) => EmbeddedObjectBuilder<O, this>
  ): void {
    if (typeof build === 'undefined') {
      this.resourceObject = buildEmbeddedObject(
        this.getTheModel()[relationType],
        this,
        this.resourceObject,
        relationType,
        href,
        buildOrObject as (
          builder: EmbeddedObjectBuilder<Model[K], this>
        ) => EmbeddedObjectBuilder<Model[K], this>
      )
    } else {
      this.resourceObject = buildEmbeddedObject(
        buildOrObject as O,
        this,
        this.resourceObject,
        relationType,
        href,
        build
      )
    }
  }

  protected abstract getTheModel(): Model
}

import { AbstractState } from '../states'
import { HalLink, ResourceObject } from './hal-format'
import { copyPrimitiveProperties } from '../utils/copy-properties'

export class EmbeddedArrayBuilder<Model, State extends AbstractState<any, any>> {
  constructor(
    private readonly models: Model[],
    public resourceObjects: ResourceObject[],
    private readonly state: State
  ) {}

  public withSelfLinks(hrefPattern: string, opts: Omit<HalLink, 'href'> = {}): this {
    return this.withAbsoluteLinks('self', hrefPattern, opts)
  }

  public withAbsoluteLinks(
    relationType: string,
    hrefPattern: string,
    opts: Omit<HalLink, 'href'> = {}
  ): this {
    return this.withLinks(relationType, this.state.req.absoluteUrl(hrefPattern), opts)
  }

  public withLinks(
    relationType: string,
    hrefPattern: string,
    opts: Omit<HalLink, 'href'> = {}
  ): this {
    for (let i = 0; i < this.models.length; i++) {
      this.resourceObjects[i]._links[relationType] = {
        href: this.state.fastify.fillInPlaceholder(hrefPattern, this.models[i]),
        ...opts,
      }
    }

    return this
  }

  public withProperties(
    define: (model: Model) => Record<string, unknown> = (model: Model) =>
      copyPrimitiveProperties(model, {}) as Record<string, unknown>
  ): this {
    for (let i = 0; i < this.models.length; i++) {
      this.resourceObjects[i] = {
        ...define(this.models[i]),
        ...this.resourceObjects[i],
      }
    }
    return this
  }

  /*
  public withEmbeddedObjects<K extends keyof Model & string>(
    relationType: K,
    hrefPattern: string,
    build: (
      builder: EmbeddedObjectBuilder<K extends keyof Model ? Model[K] : unknown, State>
    ) => EmbeddedObjectBuilder<K extends keyof Model ? Model[K] : unknown, State> = (builder) =>
      builder
  ): this {
    for (let i = 0; i < this.models.length; i++) {
      this.resourceObjects[i] = buildEmbeddedObject(
        this.models[i],
        this.state,
        this.resourceObjects[i],
        relationType,
        this.state.fastify.fillInPlaceholder(hrefPattern, this.models[i][relationType]),
        build
      )
    }
    return this
  }

   */
}

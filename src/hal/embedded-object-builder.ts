import { AbstractState } from '../states'
import { copyPrimitiveProperties } from '../copy-properties'
import { HalLink, ResourceObject } from './hal-format'
import { buildEmbeddedObject } from './build-embedded'

export class EmbeddedObjectBuilder<Model, State extends AbstractState<any, any>> {
  constructor(
    private readonly model: Model,
    public resourceObject: ResourceObject,
    private readonly state: State
  ) {}

  public withProperties<R extends Record<string, any> = Record<string, any>>(
    fn?: (model: Model) => R
  ): this
  public withProperties<R extends Record<string, any> = Record<string, any>>(properties?: R): this
  public withProperties<R extends Record<string, any> = Record<string, any>>(
    properties: R | ((model: Model) => R) = this.model as R
  ): this {
    if (typeof properties === 'function') {
      this.resourceObject = copyPrimitiveProperties(properties(this.model), this.resourceObject)
    } else {
      this.resourceObject = copyPrimitiveProperties(properties, this.resourceObject)
    }

    return this
  }

  public withProperty(key: string, value: string | number | boolean | (string | number)[]): this {
    this.resourceObject[key] = value
    return this
  }

  public withAbsoluteLink(
    relationType: string,
    href: string,
    opts: Omit<HalLink, 'href'> = {}
  ): this {
    return this.withLink(relationType, this.state.req.absoluteUrl(href), opts)
  }

  public withLink(relationType: string, href: string, opts: Omit<HalLink, 'href'> = {}): this {
    this.resourceObject._links[relationType] = {
      href: this.state.req.absoluteUrl(href),
      ...opts,
    }
    return this
  }

  public withAbsoluteEmbeddedObject<K extends string, O extends Record<string, any>>(
    relationType: K,
    href: string,
    object: O,
    build: (builder: EmbeddedObjectBuilder<O, State>) => EmbeddedObjectBuilder<O, State>
  ): this
  public withAbsoluteEmbeddedObject<K extends keyof Model & string>(
    relationType: K,
    href: string,
    build: (
      builder: EmbeddedObjectBuilder<Model[K], State>
    ) => EmbeddedObjectBuilder<Model[K], State>
  ): this
  public withAbsoluteEmbeddedObject<K extends keyof Model & string, O extends Record<string, any>>(
    relationType: K,
    href: string,
    buildOrObject:
      | ((
          builder: EmbeddedObjectBuilder<Model[K], State>
        ) => EmbeddedObjectBuilder<Model[K], State>)
      | O,
    build?: (builder: EmbeddedObjectBuilder<O, State>) => EmbeddedObjectBuilder<O, State>
  ): this {
    return this.withEmbeddedObject(
      relationType,
      this.state.req.absoluteUrl(href),
      // TODO
      // @ts-ignore
      buildOrObject,
      build
    )
  }

  public withEmbeddedObject<K extends string, O extends Record<string, any>>(
    relationType: K,
    href: string,
    object: O,
    build: (builder: EmbeddedObjectBuilder<O, State>) => EmbeddedObjectBuilder<O, State>
  ): this
  public withEmbeddedObject<K extends keyof Model & string>(
    relationType: K,
    href: string,
    build: (
      builder: EmbeddedObjectBuilder<Model[K], State>
    ) => EmbeddedObjectBuilder<Model[K], State>
  ): this
  public withEmbeddedObject<K extends keyof Model & string, O extends Record<string, any>>(
    relationType: K,
    href: string,
    buildOrObject:
      | ((
          builder: EmbeddedObjectBuilder<Model[K], State>
        ) => EmbeddedObjectBuilder<Model[K], State>)
      | O,
    build?: (builder: EmbeddedObjectBuilder<O, State>) => EmbeddedObjectBuilder<O, State>
  ): this {
    if (typeof buildOrObject === 'undefined') {
      this.resourceObject = buildEmbeddedObject(
        this.model[<keyof Model>relationType],
        this.state,
        this.resourceObject,
        relationType,
        href,
        buildOrObject
      )
    } else {
      this.resourceObject = buildEmbeddedObject(
        buildOrObject as O,
        this.state,
        this.resourceObject,
        relationType,
        href,
        build
      )
    }

    return this
  }
}

import { EmbeddedObjectBuilder } from './embedded-object-builder'
import { AbstractState } from '../states'
import { ResourceObject } from './hal-format'
import { EmbeddedArrayBuilder } from './embedded-array-builder'

export function buildEmbeddedObject<
  Model,
  State extends AbstractState<any>,
  R extends ResourceObject
>(
  model: Model,
  state: State,
  resourceObject: R,
  relationType: string,
  href: string,
  build: (builder: EmbeddedObjectBuilder<Model, State>) => EmbeddedObjectBuilder<Model, State> = (
    builder
  ) => builder
): R {
  resourceObject._embedded[relationType] = {
    _links: {
      self: {
        href,
      },
    },
    _embedded: {},
  }

  resourceObject._embedded[relationType] = build(
    new EmbeddedObjectBuilder(
      model,
      resourceObject._embedded[relationType] as ResourceObject,
      state
    )
  ).resourceObject

  if (
    state.fastify.activateHypertextCachePattern &&
    (resourceObject._embedded[relationType] as ResourceObject)._links.self
  ) {
    resourceObject._links[relationType] = (
      resourceObject._embedded[relationType] as ResourceObject
    )._links.self
  }

  return resourceObject
}

export function buildEmbeddedArray<
  Model,
  State extends AbstractState<any>,
  R extends ResourceObject
>(
  state: State,
  resourceObject: R,
  relationType: string,
  models: Model[],
  build: (builder: EmbeddedArrayBuilder<Model, State>) => EmbeddedArrayBuilder<Model, State>
): R {
  resourceObject._embedded[relationType] = []

  for (let i = 0; i < models.length; i++) {
    resourceObject._embedded[relationType].push({
      _links: {},
      _embedded: {},
    })
  }

  resourceObject._embedded[relationType] = build(
    new EmbeddedArrayBuilder(
      models,
      resourceObject._embedded[relationType] as ResourceObject[],
      state
    )
  ).resourceObjects

  return resourceObject
}

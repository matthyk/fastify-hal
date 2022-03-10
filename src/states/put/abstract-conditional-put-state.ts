import { AbstractState } from '../abstract-state'
import { IModel } from '../../model'

export abstract class AbstractConditionalPutState<
  Model extends IModel,
  Request extends { Body?: unknown; Params?: unknown; Headers?: unknown; Querystring?: unknown }
> extends AbstractState<Model, Request> {
  protected currentModelInDatabase?: Model

  protected model?: Model

  public override async build(): Promise<void> {
    await this.before()

    try {
      this.currentModelInDatabase = await this.loadModelFromDatabase()
    } catch (e) {
      this.error(`Error while retrieving resource from database. ${e}`)
      throw this.fastify.httpErrors.internalServerError('An unexpected error occurred.')
    }

    if (!this.currentModelInDatabase) {
      throw this.fastify.httpErrors.notFound('This resource could not be found.')
    }

    await this.beforeUpdate(this.currentModelInDatabase)

    if (!this.clientHasCurrentVersion()) {
      throw this.fastify.httpErrors.preconditionFailed(
        'You do not know the current state of the specified resource.'
      )
    }

    this.model = this.createModel(this.currentModelInDatabase)
    this.model.modifiedAt = Date.now()

    try {
      await this.updateModelInDatabase(this.model)
    } catch (e) {
      this.error(`Error while updating resource in database. ${e}`)
      throw this.fastify.httpErrors.internalServerError('An unexpected error occurred.')
    }

    await this.after(this.model)

    this.defineProperties()

    await this.defineLinks()

    await this.defineEmbedded()

    this.reply.status(200)

    this.defineHttpResponse()

    return this.reply.send(this.resourceObject)
  }

  protected clientHasCurrentVersion(): boolean {
    const currentEtag = this.createEtag(this.currentModelInDatabase)
    const lastModifiedAt = this.currentModelInDatabase!.modifiedAt

    return this.req.evaluatePreconditions(lastModifiedAt, currentEtag)
  }

  protected createModel(_currentModel: Model): Model {
    return this.req.body as Model
  }

  protected after(_updatedModel: Model): Promise<void> | void {}

  protected abstract loadModelFromDatabase(): Promise<Model | undefined>

  protected abstract updateModelInDatabase(model: Model): Promise<void>

  protected async beforeUpdate(_model: Model): Promise<void> {}
}

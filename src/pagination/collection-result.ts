import { IModel } from '../model'

export interface CollectionResult<Model extends IModel> {
  results: Model[]
  totalCount: number
}

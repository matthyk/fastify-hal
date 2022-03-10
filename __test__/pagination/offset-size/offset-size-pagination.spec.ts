import { CollectionResult, OffsetSizePagination } from '../../../src/pagination'
import { IModel } from '../../../src/model'

interface TestModel extends IModel {

}

describe('offset-size pagination', () => {

  it('should only return self if there are no results', () => {
    const result: CollectionResult<TestModel> = {
      totalCount: 0,
      results: []
    }

    const pagination = new OffsetSizePagination(
      result,
      {
        size: 10,
        offset: 13
      }
    )

    const paginationResult = pagination.build()

    expect(paginationResult.self).toBeDefined()
    expect(paginationResult.next).toBeUndefined()
    expect(paginationResult.prev).toBeUndefined()
    expect(paginationResult.last).toBeUndefined()
    expect(paginationResult.first).toBeUndefined()
  })
})

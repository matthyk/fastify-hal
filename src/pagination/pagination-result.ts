export interface PaginationResult<T> {
  prev?: T
  next?: T
  self: T
  first?: T
  last?: T
}

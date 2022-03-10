export const errorSchema = {
  $id: 'Error',
  type: 'object',
  properties: {
    status: {
      type: 'integer',
    },
    message: {
      type: 'string',
    },
    error: {
      type: 'string',
    },
  },
}

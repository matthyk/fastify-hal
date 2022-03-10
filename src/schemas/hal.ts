export const halLinkSchema = {
  $id: 'HalLink',
  type: 'object',
  properties: {
    href: {
      type: 'string',
    },
    templated: {
      type: 'boolean',
    },
    title: {
      type: 'string',
    },
    hreflang: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    deprecation: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
  },
}

export const halLinksSchema = {
  $id: 'HalLinks',
  oneOf: [
    {
      $ref: 'HalLink#',
    },
    {
      type: 'array',
      items: {
        $ref: 'HalLink#',
      },
    },
  ],
}

export const resourceObjectSchema = {
  $id: 'ResourceObject',
  type: 'object',
  properties: {
    _embedded: {
      type: 'object',
      additionalProperties: {
        oneOf: [
          {
            $ref: 'ResourceObject#',
          },
          {
            type: 'array',
            items: {
              $ref: 'ResourceObject#',
            },
          },
        ],
      },
    },
    _links: {
      type: 'object',
      properties: {
        self: {
          $ref: 'HalLinks#',
        },
      },
      additionalProperties: {
        $ref: 'HalLinks#',
      },
    },
  },
}

export const resourceObjectsSchema = {
  $id: 'ResourceObjects',
  oneOf: [
    {
      $ref: 'ResourceObjects',
    },
    {
      type: 'array',
      items: {
        $ref: 'ResourceObjects',
      },
    },
  ],
}

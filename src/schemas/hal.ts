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

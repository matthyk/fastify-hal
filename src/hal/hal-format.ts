/*
  See https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08 for more details.
 */

export interface HalLink {
  /*
   Its value is either a URI [RFC3986] or a URI Template [RFC6570].
   */
  href: string

  /*
   Its value is boolean and SHOULD be true when the Link Object's "href"
   property is a URI Template.
   */
  templated?: boolean

  /*
  Its value is a string and is intended for labelling the link with a
  human-readable identifier (as defined by [RFC5988]).
   */
  title?: string

  /*
   Its value is a string and is intended for indicating the language of
   the target resource (as defined by [RFC5988]).
   */
  hreflang?: string

  /*
   Its value is a string used as a hint to indicate the media type
   expected when dereferencing the target resource.
   */
  type?: string

  /*
   Its presence indicates that the link is to be deprecated (i.e.
   removed) at a future date.  Its value is a URL that SHOULD provide
   further information about the deprecation.

   A client SHOULD provide some notification (for example, by logging a
   warning message) whenever it traverses over a link that has this
   property.  The notification SHOULD include the deprecation property's
   value so that a client maintainer can easily find information about
   the deprecation.
   */
  deprecation?: string

  /*
   Its value MAY be used as a secondary key for selecting Link Objects
   which share the same relation type.
   */
  name?: string
}

export interface ResourceObject {
  /*
   It is an object whose property names are link relation types (as
   defined by [RFC5988]) and values are either a Link Object or an array
   of Link Objects. The subject resource of these links is the Resource
   Object of which the containing "_links" object is a property.
   */
  _links: {
    /*
    Each Resource Object SHOULD contain a 'self' link that corresponds
    with the IANA registered 'self' relation (as defined by [RFC5988])
    whose target is the resource's URI.
     */
    self: HalLink

    /*
    Custom link relation types (Extension Relation Types in [RFC5988])
    SHOULD be URIs that when dereferenced in a web browser provide
    relevant documentation, in the form of an HTML page, about the
    meaning and/or behaviour of the target Resource.  This will improve
    the discoverability of the API.
     */
    [relation: string]: HalLink | HalLink[]
  }

  /*
   It is an object whose property names are link relation types (as
   defined by [RFC5988]) and values are either a Resource Object or an
   array of Resource Objects.

   Embedded Resources MAY be a full, partial, or inconsistent version of
   the representation served from the target URI.
   */
  _embedded: {
    [property: string]: ResourceObject | ResourceObject[]
  }

  [property: string]: any
}

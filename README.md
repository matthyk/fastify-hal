# fastify-hal

A Fastify plugin for REST API development using the [HAL](https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-08)
format. The plugin tends to be more like a framework of its own, but at its core it's a normal plugin, so you can work 
with Fastify as usual. Before we start, I would like to explain why this plugin is so useful.

## Hypermedia is hard

`Hypermedia as the Engine of Application State` or `HATEOAS` is one of the most fundamental constraints that an API 
must comply with in order to be a REST API. At the same time, it is also one of the most difficult requirements to 
implement.
I see 2 reasons for this. On the one hand, many people are still very unfamiliar with implementing hypermedia in the 
backend and on the other hand, there are very few tools that make the very complex development of hypermedia APIs easier.
This plugin tries to solve the second problem. If you want a very (very) short explanation of hypermedia see [here](#what-is-hypermedia).


## Acknowledgement

This project is kind of a successor to an older project of mine that you can find [here](https://github.com/matthyk/rosmarin). 
I even published a paper about 
it with the title `Design and Implementation of a Node.js Framework for the
Development of RESTful APIs`. If you want a detailed description of the project you can find the paper [here](https://conferences.ulbsibiu.ro/icdd/2021/files/Proceedings_ICDD2021.pdf
).
Like the previous project, this project is based on the concepts of Norbury. Nobury is part of the research project
[GeMARA](https://fiw.fhws.de/forschung/projekte/gemara/) of the App.lab of the University of Applied Sciences Wuerzburg-Schweinfurt, which focuses on the automatic 
generation of REST APIs.


## Usage

> Even though the plugin can be used with JavaScript, it is highly recommended to use it with TypeScript.

Just like any other plugin, `fastify-hal` can be added via the `register` call.

**index.ts**

```typescript
import Fastify from 'fastify'
import fastifyHal from 'fastify-hal'

const fastify = Fastify()

fastify.register(fastifyHal)
```

Now we want to add a route with which you can add a user. This user should have a name and an age. To do this, we first 
define the user model and the necessary schema and type using `@sinclair/typebox`.

***user.model.ts***

```typescript
import { IModel } from 'fastify-hal'

// IModel is used to add the properties id, modifiedAt and createdAt which are required by fastify-hal
export interface User extends IModel {
  name: string
  age: number
}
```

**user.schema.ts**

```typescript
import { Static, Type } from '@sinclair/typebox'

export const createUserSchema = Type.Object( {
  body: Type.Object({
    name: Type.String(),
    age: Type.Integer()
  })
} )

export const createUserResponseSchema = {
  201: Type.Object({
    id: Type.Number(),
    name: Type.String(),
    age: Type.Integer()
  })
}

export type CreateUser = Static<typeof createUserSchema>
```

Before we can create the route, we still need to write the route handler. However, with fastify-hal this happens not as 
usual in a method but in a whole class. For this purpose fastify-hal provides several abstract classes that can be used 
as base classes. These help in the implementation of hypermedia, but also support the developers in other topics such as 
pagination. Fastify-hal provides a fully automatic offset size pagination. In the following we create such a class to 
create the user resource.

**create-user.state.ts**

```typescript
import { AbstractPostState } from 'fastify-hal'
import { User } from './user.model'
import { CreateUser } from './user.schema'

export class CreateUserState extends AbstractPostState<User, CreateUser> {
  
  // We have full access to the encapsulated fastify instance and to the request and response object.
  // The request is also fully typed by "CreateUser".

  // The return value of this method is saved in the class property "createdModel"
  protected async saveModelInDatabase(): Promise<Post> {
    // Save user in database
    return {
      id: 334,
      name: "Matthias",
      age: 23,
      modifiedAt: 3432423,
      createdAt: 3432423,
    }
  }

  protected override defineLinks(): void | Promise<void> {
    // link to get all users
    this.addAbsoluteLink('getAllUsers', '/users')
    // but we can also link to other resources such as all posts of the current user
    this.addAbsoluteLink('getAllPostsOfUser', `/users/${this.createdModel.id}/posts`)
  }
  
  private readonly suggestedPosts = [
    {
      id: 1,
      title: 'First Post',
      text: 'Maybe you like this post'
    },
    {
      id: 1,
      title: 'Second Post',
      text: 'Maybe you like this post, too'
    }
  ]

  // We can also add embedded objects
  protected override defineEmbedded(): void | Promise<void> {
    // For example, the list of posts that the newly created user might like can be added to the reply
    this.addEmbeddedArray( 'suggestedPosts', suggestedPosts, builder =>
      // To every post element in the array a self link is added.
      // For this we can specify a template here, and each property that stands between {} will be replaced by the value in the respective object.
      builder
        .withSelfLinks( '/posts/{id}' )
        // Call this to embedded every property of the post object to the response
        .withProperties(),
    )
  }
}
```

We can now register this state using the decorators provided by `fastify-hal`

**index.ts**

```typescript
import { createPostResponseSchema, createPostSchema } from './create-post.schema'

fastify.postState( {
  url: '/users',
  schema: {
    ...createPostSchema,
    response: createPostResponseSchema
  }
}, CreateUserState )
```

If we now call this route via, we will get the following response:

```json
{
  "id": 334,
  "age": 23,
  "name": "Matthias",
  "_links": {
    "self": {
      "href": "http:localhost:8080/users"
    },
    "getAllUsers": {
      "href": "http:localhost:8080/users"
    },
    "getAllPostsOfUser": {
      "href": "http:localhost:8080/users/334/posts"
    }
  },
  "_embedded": {
    "suggestedPosts": [
      {
        "id": 1,
        "title": "First Post",
        "text": "Maybe you like this post",
        "_links": {
          "self": {
            "href": "http:localhost:8080/posts/1"
          }
        }
      },
      {
        "id": 2,
        "title": "Second Post",
        "text": "Maybe you like this post, too",
        "_links": {
          "self": {
            "href": "http:localhost:8080/posts/2"
          }
        }
      }
    ]
  }
}
```

## What is Hypermedia?

When implementing hypermedia in the backend, the server is responsible for including in each response to the client all 
possible links that the client can call next. It is very similar to the Anchor element in HTML. So, for example, if the 
client requests a user resource, in addition to the normal response, the server could also send the client the links to 
send a friend request to this just requested user.

As book tips about this quite complex topic I can recommend `REST und HTTP: Entwicklung und Integration 
nach dem Architekturstil des Web` from Tilkov et al. and `RESTful Web APIs: Services for a Changing World` 
from Richardson et al.


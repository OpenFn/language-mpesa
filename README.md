Language h2tp
==============

Language Pack for building expressions and operations to make HTTP calls.

Documentation
-------------
## Get

#### sample configuration
```js
{
  "username": "taylor@openfn.org",
  "password": "supersecret",
  "baseUrl": "https://instance_name.surveycto.com",
  "authType": "digest"
}
```

#### sample GET expression
```js
fetch(
  fields(
    field("endpoint", "api/v1/forms/data/wide/json/mod_coach"),
    field("query", function(state) {
      return { date: 1463617524000 }
    }),
    field("returnUrl", "http://localhost:4000/inbox/8ad63a29-5c25-4d8d-ba2c-fe6274dcfbab")
  )
)

```

[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.

Language h2tp
==============

Language Pack for building expressions and operations to make HTTP calls.

Documentation
-------------
## Get

#### sample GET expression
```js
get(
  fields(
    field("endpoint", "patient_records"),
    field("query", function(state) {
      var params = {
        date: dataValue("prop_a")(state)
      }
      return params
    })
  )
)
```

[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.

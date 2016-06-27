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
    field("params", function(state) {
      return [
        dataElement("qrur9Dvnyt5", dataValue("prop_a"))(state)
        dataElement("oZg33kd9taw", dataValue("prop_b"))(state)
        dataElement("msodh3rEMJa", dataValue("prop_c"))(state)
      ]
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

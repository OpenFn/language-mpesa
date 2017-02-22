Language HTTP [![Build Status](https://travis-ci.org/OpenFn/language-http.svg?branch=master)](https://travis-ci.org/OpenFn/language-http)
=============

Language Pack for building expressions and operations to make HTTP calls.

Documentation
-------------
## Fetch

#### sample configuration
```js
{
  "username": "taylor@openfn.org",
  "password": "supersecret",
  "baseUrl": "https://instance_name.surveycto.com",
  "authType": "digest"
}
```

#### sample fetch expression
```js
fetch({
  "getEndpoint": "api/v1/forms/data/wide/json/mod_coach",
  "query": function(state) {
      return { "date": dataValue("_json[(@.length-1)].SubmissionDate")(state) }
  },
  "postUrl": "http://localhost:4000/inbox/8ad63a29-5c25-4d8d-ba2c-fe6274dcfbab",
})
```

#### sample custom GET and then POST
```js
get("forms/data/wide/json/form_id", {
  query: function(state) {
    return { date: state.lastSubmissionDate || "Aug 29, 2016 4:44:26 PM"}
  },
  callback: function(state) {
    // Pick submissions out in order to avoid `post` overwriting `response`.
    var submissions = state.response.body;
    // return submissions
    return submissions.reduce(function(acc, item) {
        // tag submissions as part of the "form_id" form
        item.formId = "form_id"
        return acc.then(
          post(
            "https://www.openfn.org/inbox/very-very-secret",
            { body: item }
          )
        )
      }, Promise.resolve(state))
      .then(function(state) {
        if (submissions.length) {
          state.lastSubmissionDate = submissions[submissions.length-1].SubmissionDate
        }
        return state;
      })
      .then(function(state) {
        delete state.response
        return state;
      })
  }
})
```

### Sample post with existing data
```js
postData({
  url: "INSERT_URL_HERE",
  "body": function(state) {
        return {
          "field_1": "some_data",
          "field_2": "some_more_data",
          "field_id": dataValue("Some.Json.Object.Id")(state)
        }

  },
  headers: {
      "Authorization": "AUTH_KEY",
      "Content-Type": "application/json"
  }
})

```

[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.

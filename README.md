Language MPESA [![Build Status](https://travis-ci.org/OpenFn/language-mpesa.svg?branch=master)](https://travis-ci.org/OpenFn/language-mpesa)
=============

Language Pack for building expressions and operations to interact with Safaricom's MPESA mobile money system.

Plan (wip, to be moved to creds on OpenFn/core)
-------------
1. add MPESA credentials and give user a button to register this inbox URL.
2. check inbox for successful registration.
3. add button on credentials to de-register.
4. language-mpesa allows posting of payments.
5. regular inbox allows receipt of confirmation.

Documentation
-------------
#### sample configuration
```js
{
  "username": "taylor@openfn.org",
  "password": "supersecret",
  "baseUrl": "https://instance_name.surveycto.com",
  "authType": "digest"
}
```

Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.

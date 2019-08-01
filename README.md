Language MPESA [![Build Status](https://travis-ci.org/OpenFn/language-mpesa.svg?branch=master)](https://travis-ci.org/OpenFn/language-mpesa)
=============

Language Pack for building expressions and operations to interact with
Safaricom's MPESA mobile money system.

## Likely order of operations:
### 1. register a validation/confirmation URL (to receive C2B notifiactions)

### 2. request a payment from a customer (B2C)
sample `expression.js`
```js
requestPayment({
  ...
});
```

### 3. receive payment notification (C2B)
Use https://developer.safaricom.co.ke/c2b/apis/post/simulate for testing.
```
curl -X POST --header "Content-Type: application/json" --header "Authorization: Bearer XXXXXXXXXXXXXXXXXXXXXXXXXX" -d "{
    \"ShortCode\": \"601402\",
    \"CommandID\": \"CustomerPayBillOnline\",
    \"Amount\": \"15\",
    \"Msisdn\": \"0014159523087\",
    \"BillRefNumber\": \"2\"
}" "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate"
```

## Plan (wip, to be moved to credentials on OpenFn/core)
1. add MPESA credentials and give user a button to register this inbox URL.
2. check inbox for successful registration.
3. add button on credentials to de-register.
4. language-mpesa allows posting of payments.
5. regular inbox allows receipt of confirmation.

## Documentation
#### sample configuration
```js
{
  "username": "taylor@openfn.org",
  "password": "supersecret",
  "baseUrl": "https://instance.com",
  "authType": "digest"
}
```

Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.

# Language MPESA [![Build Status](https://travis-ci.org/OpenFn/language-mpesa.svg?branch=master)](https://travis-ci.org/OpenFn/language-mpesa)

Language Pack for building expressions and operations to interact with
Safaricom's MPESA mobile money system.

***Consider https://github.com/safaricom/mpesa-node-library, but it's es6***

## Likely order of operations:

### 1. register a validation/confirmation URL (to receive C2B notifiactions)

This is probably done via the CLI:

```
registerUrl("https://www.openfn.org/inbox/123abc456?type=customerPayment");
```

### 2. request a payment from a customer (B2C)

sample `expression.js`

```js
requestPayment({
  InitiatorName: 'testapi402', // This is the credential/username used to authenticate the transaction request. -
  SecurityCredential: 'Safaricom111!', // Base64 encoded string of the Security Credential, which is encrypted using M-Pesa public key and validates the transaction on M-Pesa Core system. (Defaults to credential value.)
  CommandID: '', // Unique command for each transaction type e.g. SalaryPayment, BusinessPayment, PromotionPayment
  Amount: '', // The amount being transacted
  PartyA: '601402', // Organization’s shortcode initiating the transaction. (Defaults to credential value.)
  PartyB: '', // Phone number receiving the transaction
  Remarks: 'OpenFn test.', // Comments that are sent along with the transaction.
  QueueTimeOutURL: '', // The timeout end-point that receives a timeout. (Defaults to credential value.)
  ResultURL: '', // The end-point that receives the response of the transaction. (Defaults to credential value.)
  Occassion: '', // Optional
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

```json
{
  "consumerKey": "someKey",
  "consumerSecret": "someSecret",
  "shortCode": "your6digitShortCode",
  "hostUrl": "https://sandbox.safaricom.co.ke"
}
```

## Development

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.

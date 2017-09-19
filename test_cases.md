# Test Case Responses for OpenFn's C2B App

## Generate OAuth Token
Request:
```sh
curl -X GET --header "Authorization: Basic VUlFYmtHYUQ2MnJIQVAyaDBFRlpzVFVOQ1VCSUx3eGU6QjE5anBIYnEzYWVDcVFkUQ==" "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
```

```
HTTP/1.1 200 OK
Cache-Control: no-store
Connection: keep-alive
Content-Length: 113
Content-Type: application/json;charset=UTF-8
Date: Tue, 19 Sep 2017 12:21:55 GMT
Server: Apigee Router
```
Body:
```json
{
  "access_token": "WQEIWJvUqLJfecyvKFsPPjkG4VMv",
  "expires_in": "3599"
}
```

## Register Validation & Confirmation URLs for C2B
Request:
```sh
curl -X POST --header "Content-Type: application/json" --header "Authorization: Bearer WQEIWJvUqLJfecyvKFsPPjkG4VMv" -d "{
    \"ShortCode\": \"964567\" ,
    \"ResponseType\": \"Cancelled\",
    \"ConfirmationURL\": \"https://www.openfn.org/inbox/secret-customer-uuid\",
    \"ValidationURL\": \"https://www.openfn.org/inbox/secret-customer-uuid\"
}" "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
```

Response Headers:
```
HTTP/1.1 200 OK
Cache-Control: no-store
Connection: keep-alive
Content-Length: 142
Content-Type: application/json;charset=UTF-8
Date: Tue, 19 Sep 2017 12:24:34 GMT
Server: Apigee Router
```

Response Body:
```json
{
  "ConversationID": "",
  "OriginatorCoversationID": "",
  "ResponseDescription": "success"
}
```

## Simulate C2B Paybill Transaction
Request:
```sh
curl -X POST --header "Content-Type: application/json" --header "Authorization: Bearer WQEIWJvUqLJfecyvKFsPPjkG4VMv" -d "{
    \"ShortCode\": \"964567\",
    \"CommandID\": \"CustomerPayBillOnline\",
    \"Amount\": \"100\",
    \"Msisdn\": \"254100576328\",
    \"BillRefNumber\": \"testbill\"
}" "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate"
```

Response Headers:
```
HTTP/1.1 200 OK
Cache-Control: no-store
Connection: keep-alive
Content-Length: 233
Content-Type: application/json;charset=UTF-8
Date: Tue, 19 Sep 2017 12:24:32 GMT
Server: Apigee Router
```
Body:
```json
{
  "ConversationID": "AG_20170919_00004810c0c429f4081f",
  "OriginatorCoversationID": "14590-1121121-1",
  "ResponseDescription": "The service request has been accepted successfully."
}
```

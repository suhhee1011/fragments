POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a plain text fragment
Content-Type: text/plain; charset=utf-8
```This is a fragment!```


HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/plain; charset=utf-8"
jsonpath "$.fragment.size" == 19
[Captures]
url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# Unauthorized GET By ID 

GET {{url}}
Authorization: Basic wrongBasicAuth

HTTP/1.1 401


# GET By wrongID

GET http://localhost:8080/v1/fragments/withWrongId
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 404



# GET fragments info By wrong ID

GET http://localhost:8080/v1/fragments/withWrongId/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 404


# GET?expand=1 with wrong auth

GET http://localhost:8080/v1/fragments?expand=1
Authorization: Basic wrongAuth

HTTP/1.1 401


# GET only ids with wrong auth

GET http://localhost:8080/v1/fragments
Authorization: Basic wrongAuth

HTTP/1.1 401




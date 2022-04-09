# tests/integration/lab-10-dynamodb.hurl
# 1. POST a new JSON fragment to http://localhost:8080 as an authorized user. The fragment's body should be the JSON value, { "service": "DynamoDB" }.

POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: application/json; charset=utf-8
{"service": "DynamoDB"}

# 2. Confirm that the server returns a 201, and capture the Location header value to a variable named url
HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json; charset=utf-8"
jsonpath "$.fragment.size" == 23

[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"


# 3. GET the fragment you just created using the url as an authorized user.

GET {{fragment1_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==


HTTP/1.1 200
Content-Type: application/json; charset=utf-8
Content-Length: 260
[Asserts]
jsonpath "$.fragments.id" == {{fragment1_id}}


# 4. POST a second Markdown fragment to http://localhost:8080 as the same authorized user. The fragment's body should be the Markdown value, DynamoDB is **great**..

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a plain text fragment
Content-Type: text/markdown
# Body of the request goes in ```...``` when it's a string
```DynamoDB is **great**```


# 5. Confirm that the server returns a 201, and once again capture the Location header value and the second id in variables named fragment2_url and fragment2_id.
HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 21
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"


# 6. GET the fragment info (i.e., metadata) you just created using the url/info as an authorized user and confirm that the server returns a 200 and that all of the metadata properties match what you expect.

GET {{fragment2_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==


HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.fragments.id" == {{fragment2_id}}

# 7. GET all of the fragments for the same authorized user without expanding them (i.e., just get back the IDs) and confirm that the list of fragments includes the two id values you captured above
GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==


HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}


# 8. DELETE the first fragment you created above
DELETE {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# 9.Confirm that the server returns a 200
HTTP/1.1 200

# 10. Try to GET the first fragment again using the url you captured above as the authorized user.
GET {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# 11. Confirm that the server returns a 404, since the fragment should be deleted.
HTTP/1.1 404

[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect to get back a JSON response with { ..., "error":{"code":..., ...}}
jsonpath "$.error.code" == 404
# We expect to get back a JSON response with { ..., "error":{... , "message":"..."}}
jsonpath "$.error.message" == "not found"


# 12. GET all of the fragments for the same authorized user without expanding them (i.e., just get back the IDs) a second time, and confirm that the first id is NOT included but that the second id is (i.e., that the second was deleted).
GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==


HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" not includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}

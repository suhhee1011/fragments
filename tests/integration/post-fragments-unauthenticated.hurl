POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3sdfsd==
# We're sending a plain text fragment
Content-Type: image/png
# Body of the request goes in ```...``` when it's a string
```This is a fragment!```

# 1. We expect to get back an HTTP 401
HTTP/1.1 401


# Extra checks to perform against the response
[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect to get back a JSON response with { ..., "error":{"code":..., ...}}
jsonpath "$.error.code" == 401
# We expect to get back a JSON response with { ..., "error":{... , "message":"..."}}
jsonpath "$.error.message" == "Unauthorized"

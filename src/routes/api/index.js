// src/routes/api/index.js
const { Fragment } = require('../../model/fragment');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();
const { getId, getInfo, getAllFragment } = require('./get');

// Define our first route, which will be: GET /v1/fragments
// router.get('/fragments', getBasic);
router.get('/fragments/:id', getId);
router.get('/fragments', getAllFragment);
router.get('/fragments/:id/:info', getInfo);

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
router.post('/fragments', rawBody(), require('./post'));
module.exports = router;

// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const API_URL = process.env.API_URL;
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  // TODO: this is just a placeholder to get something working...
  if (Buffer.isBuffer(req.body)) {
    // const fragment = new Fragment();
    const fragment = new Fragment({
      ownerId: req.user,
      type: req.headers['content-type'],
      size: Buffer.byteLength(req.body),
    });
    logger.debug(fragment);
    await fragment.save();
    await fragment.setData(req.body);

    res.setHeader('Location', `https://${API_URL}/V1/fragments/${fragment.id}`);
    const successResponse = createSuccessResponse({ fragment });
    res.status(201).json(successResponse);
  } else {
    logger.debug(req.body);
    res.status(415).json(createErrorResponse(415, 'Is not a buffer'));
  }
};

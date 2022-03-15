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
  // if (Buffer.isBuffer(req.body)) {
  if (req.body) {
    // const fragment = new Fragment();
    if (!Buffer.isBuffer(req.body)) {
      req.body = new Buffer.from(req.body.toString());
    }
    try {
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
    } catch {
      res
        .status(420)
        .json(createErrorResponse(420, 'error catched while creating fragment from post'));
    }
  } else {
    logger.debug(req.body);
    res.status(415).json(createErrorResponse(415, 'req.body is not exist'));
    // res.status(415).json(createErrorResponse(415, 'Is not a buffer'));
  }
};
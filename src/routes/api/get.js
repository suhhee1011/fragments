// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const { readFragmentData, readFragment } = require('../../../src/model/data/index');
const { Fragment } = require('../../../src/model/fragment');
const logger = require('../../logger');
var mime = require('mime-types');
const path = require('path');
var md = require('markdown-it')({
  html: true,
});

const getAllFragment = async (req, res) => {
  logger.debug(req.query.expand);
  if (req.query.expand === '1') {
    logger.debug('In expand 1');
    try {
      const returnedFragment = await Fragment.byUser(req.user, true);
      return res.status(200).json(createSuccessResponse({ fragments: returnedFragment }));
    } catch (err) {
      const errorResponse = createErrorResponse(500, 'Internal error');
      res.status(500).json(errorResponse);
    }
  } else {
    try {
      const returnedFragment = await Fragment.byUser(req.user, false);
      return res.status(200).json(createSuccessResponse({ fragments: returnedFragment }));
    } catch (err) {
      const errorResponse = createErrorResponse(500, 'Internal error');
      res.status(500).json(errorResponse);
    }
  }
};

const getId = async (req, res) => {
  logger.debug('getID entered');
  const idExt = path.parse(req.params.id);
  var metaDataFragment;
  var fragment;
  logger.debug('before returnFragment ');
  let returnedFragment = await readFragmentData(req.user, idExt.name);
  logger.debug('After returnFragment ');
  if (returnedFragment) {
    metaDataFragment = await readFragment(req.user, idExt.name);
    fragment = new Fragment(metaDataFragment);
  } else {
    const errorResponse = createErrorResponse(404, 'not found');
    return res.status(404).json(errorResponse);
  }
  logger.debug(idExt.ext);
  logger.debug(returnedFragment.for);
  if (idExt.ext) {
    const ext = mime.lookup(idExt.ext);
    logger.debug(ext);
    logger.debug(fragment);
    if (fragment.formats.includes(ext)) {
      if (fragment.type == 'text/markdown' && idExt.ext == '.html') {
        returnedFragment = md.render(returnedFragment.toString());
        logger.debug(returnedFragment);
      }
    } else {
      const errorResponse = createErrorResponse(415, 'Invalid extension');
      return res.status(415).json(errorResponse);
    }
  }
  res.setHeader('Content-Type', metaDataFragment.type);
  res.setHeader('Content-Length', metaDataFragment.size);
  res.status(200).send(returnedFragment);
};
const getInfo = async (req, res) => {
  try {
    const returnedFragment = await Fragment.byId(req.user, req.params.id);
    return res.status(200).json(createSuccessResponse({ fragments: returnedFragment }));
  } catch (err) {
    const errorResponse = createErrorResponse(404, 'not found');
    res.status(404).json(errorResponse);
  }
};

module.exports = { getId, getAllFragment, getInfo };

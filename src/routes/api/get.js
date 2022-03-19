// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const {
  readFragmentData,
  readFragment,
  listFragments,
} = require('../../../src/model/data/memory/index');
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

/**
 * Get a list of fragments for the current user
 */
const getBasic = (req, res) => {
  // TODO: this is just a placeholder to get something working...
  const returnedFragment = listFragments(req.user, false);
  // req.query.expand
  if (returnedFragment) {
    res.setHeader('Content-Type', metaDataFragment.type);
    res.setHeader('Content-Length', metaDataFragment.size);
    res.status(200).send(returnedFragment);
  } else {
    const data = { fragments: [] };
    const successResponse = createSuccessResponse(data);
    res.status(200).json(successResponse);
  }

  var metaDataFragment;
  // var fragment;

  // if (returnedFragment) {
  //   metaDataFragment = await readFragment(req.user, idExt[0]);
  //   fragment = new Fragment(metaDataFragment);
  // }

  logger.debug({ hash: req.user }, 'getAllFragment');
  if (!returnedFragment) {
    const errorResponse = createErrorResponse(404, 'not found');
    res.status(404).json(errorResponse);
  } else {
    res.setHeader('Content-Type', metaDataFragment.type);
    res.setHeader('Content-Length', metaDataFragment.size);
    res.status(200).send(returnedFragment);
  }
};

const getId = async (req, res) => {
  // TODO: this is just a placeholder to get something working...
  const idExt = path.parse(req.params.id);

  var metaDataFragment;
  var fragment;
  let returnedFragment = await readFragmentData(req.user, idExt.name);
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
      //text/plain
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

module.exports = { getBasic, getId, getAllFragment, getInfo };

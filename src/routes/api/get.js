// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const { readFragmentData, readFragment } = require('../../../src/model/data/index');
const { Fragment } = require('../../../src/model/fragment');
const logger = require('../../logger');
var mime = require('mime-types');
const path = require('path');
const { ListExportsCommand } = require('@aws-sdk/client-dynamodb');
const { MetadataEntry } = require('@aws-sdk/client-s3');
var md = require('markdown-it')({ html: true });
const sharp = require('sharp');

// const { markdownToTxt } = require('markdown-to-txt');

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
const convert = (type, idExt, returnedFragment) => {
  const ext = mime.lookup(idExt.ext);
  if (type == 'text/markdown' && ext == 'text/html') {
    returnedFragment = md.render(returnedFragment.toString());
  } else if (
    (type == 'text/markdown' ||
      type == 'text/html' ||
      type == 'application/json' ||
      type == 'text/html') &&
    ext == 'text/html'
  ) {
    returnedFragment.type = 'text/plain';
  } else if (
    (type == 'image/png' || type == 'image/jpeg' || type == 'image/webp' || type == 'image/gif') &&
    (ext == 'image/png' || ext == 'image/jpeg' || ext == 'image/webp' || ext == 'image/gif')
  ) {
    sharp(returnedFragment).toFile(`${returnedFragment.id}.${idExt.ext}`);
  }

  return returnedFragment;
};
const getId = async (req, res) => {
  logger.debug('getID entered');

  let metaDataFragment;
  const idExt = path.parse(req.params.id);
  let returnedFragment = await readFragmentData(req.user, idExt.name);
  logger.debug(returnedFragment.toString());
  if (returnedFragment) {
    metaDataFragment = await Fragment.byId(req.user, idExt.name);
  } else {
    const errorResponse = createErrorResponse(404, 'not found');
    return res.status(404).json(errorResponse);
  }

  if (idExt.ext) {
    const ext = mime.lookup(idExt.ext);
    logger.debug(metaDataFragment.formats);
    logger.debug(ext);
    if (metaDataFragment.formats.includes(ext)) {
      returnedFragment = convert(metaDataFragment.type, ext, returnedFragment);
      res.setHeader('Content-Type', ext);
    } else {
      const errorResponse = createErrorResponse(415, 'Invalid extension');
      return res.status(415).json(errorResponse);
    }
  } else {
    res.setHeader('Content-Type', metaDataFragment.type);
  }

  res.setHeader('Content-Length', metaDataFragment.size);
  logger.debug('metaDataFragment.type');
  logger.debug(metaDataFragment.type);
  logger.debug('metaDataFragment.size');
  logger.debug(metaDataFragment.size);

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

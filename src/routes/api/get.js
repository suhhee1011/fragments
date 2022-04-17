// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const { readFragmentData } = require('../../../src/model/data/index');
const { Fragment } = require('../../../src/model/fragment');
const logger = require('../../logger');
var mime = require('mime-types');
const path = require('path');
var md = require('markdown-it')({ html: true });
const sharp = require('sharp');
const fs = require('fs');

const getAllFragment = async (req, res) => {
  logger.debug(req.query.expand);
  let checkExpand = req.query.expand === '1' ? true : false;
  try {
    const returnedFragment = await Fragment.byUser(req.user, checkExpand);
    return res.status(200).json(createSuccessResponse({ fragments: returnedFragment }));
  } catch (err) {
    const errorResponse = createErrorResponse(500, 'Internal error to get all fragment of user');
    res.status(500).json(errorResponse);
  }
};
const convert = (type, ext, returnedFragment) => {
  if (type == 'text/markdown' && ext == 'text/html') {
    returnedFragment = md.render(returnedFragment.toString());
    returnedFragment.type = 'text/html';
  } else if (
    (type == 'text/markdown' ||
      type == 'text/html' ||
      type == 'application/json' ||
      type == 'text/html') &&
    ext == 'text/html'
  ) {
    returnedFragment.type = 'text/plain';
  } else if (
    type == 'image/png' ||
    type == 'image/jpeg' ||
    type == 'image/webp' ||
    type == 'image/gif'
  ) {
    logger.debug(typeof returnedFragment);
    if (ext == 'image/png') {
      returnedFragment = sharp(returnedFragment).png().toBuffer();
    } else if (ext == 'image/jpeg') {
      returnedFragment = sharp(returnedFragment).jpeg().toBuffer();
    } else if (ext == 'image/webp') {
      returnedFragment = sharp(returnedFragment).webp().toBuffer();
    } else if (ext == 'image/gif') {
      returnedFragment = sharp(returnedFragment).gif().toBuffer();
    }
    returnedFragment.type = ext;
  }

  return returnedFragment;
};
const getId = async (req, res) => {
  logger.debug('getID entered');

  let metaDataFragment;
  const idExt = path.parse(req.params.id);
  let returnedFragment = await readFragmentData(req.user, idExt.name);

  if (returnedFragment) {
    metaDataFragment = await Fragment.byId(req.user, idExt.name);
  } else {
    const errorResponse = createErrorResponse(404, 'not found');
    return res.status(404).json(errorResponse);
  }

  if (idExt.ext != '') {
    const ext = mime.lookup(idExt.ext);
    logger.debug(metaDataFragment.formats);
    logger.debug(ext);

    if (metaDataFragment.formats.includes(ext)) {
      res.setHeader('Content-Type', ext);
      returnedFragment = convert(metaDataFragment.type, ext, returnedFragment);
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

  return res.status(200).send(returnedFragment);
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

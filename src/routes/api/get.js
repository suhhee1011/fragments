// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const { readFragmentData, readFragment } = require('../../../src/model/data/memory/index');
const { Fragment } = require('../../../src/model/fragment');
var mime = require('mime-types');
/**
 * Get a list of fragments for the current user
 */
const getBasic = (req, res) => {
  // TODO: this is just a placeholder to get something working...
  const data = { fragments: [] };
  const successResponse = createSuccessResponse(data);
  res.status(200).json(successResponse);
};

const getId = async (req, res) => {
  // TODO: this is just a placeholder to get something working...
  const idExt = req.params.id.split('.');
  const returnedFragment = await readFragmentData(req.user, idExt[0]);
  const metaDataFragment = await readFragment(req.user, idExt[0]);
  const fragment = new Fragment(metaDataFragment);
  if (idExt[1]) {
    const ext = mime.lookup(idExt[1]);
    if (fragment.formats.includes(ext)) {
      //text/plain
      const errorResponse = createErrorResponse(415, 'Invalid extension');
      res.status(415).json(errorResponse);
    }
  } else {
    if (!returnedFragment) {
      const errorResponse = createErrorResponse(404, 'not found');
      res.status(404).json(errorResponse);
    } else {
      res.setHeader('Content-Type', metaDataFragment.type);
      res.setHeader('Content-Length', metaDataFragment.size);
      res.status(200).send(returnedFragment);
    }
  }
};
module.exports = { getBasic, getId };

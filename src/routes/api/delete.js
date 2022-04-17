// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const { deleteFragment } = require('../../../src/model/data/index');

const path = require('path');
const logger = require('../../logger');

const deleteById = async (req, res) => {
  const idExt = path.parse(req.params.id);
  try {
    logger.debug(idExt);
    logger.debug(idExt.name);
    let returnedFragment = await deleteFragment(req.user, idExt.name);
    console.log(returnedFragment);
    logger.debug(returnedFragment);

    const successResponse = createSuccessResponse('deleted');
    return res.status(200).json(successResponse);
  } catch {
    const errorResponse = createErrorResponse(404, 'Error while deleting');
    return res.status(404).json(errorResponse);
  }
};

module.exports = { deleteById };

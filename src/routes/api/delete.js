// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const { deleteFragment } = require('../../../src/model/data/index');
// const { Fragment } = require('../../../src/model/fragment');

const path = require('path');

const deleteById = async (req, res) => {
  const idExt = path.parse(req.params.id);
  try {
    await deleteFragment(req.user, idExt.name);
    const successResponse = createSuccessResponse('deleted');
    return res.status(200).json(successResponse);
  } catch {
    const errorResponse = createErrorResponse(404, 'not found');
    return res.status(404).json(errorResponse);
  }
};

module.exports = { deleteById };

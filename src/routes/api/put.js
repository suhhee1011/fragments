// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { readFragmentData, readFragment } = require('../../../src/model/data/index');
const API_URL = process.env.API_URL;
const path = require('path');
/**
 * Get a list of fragments for the current user
 */

module.exports = async (req, res) => {
  try {
    const metaDataFragment = await Fragment.byId(req.user, req.params.id);

    logger.debug(req.headers['content-type']);

    if (metaDataFragment.type == req.headers['content-type']) {
      await metaDataFragment.setData(req.body);

      // TODO: To confirm
      // res.setHeader('Location', `${API_URL}/v1/fragments/${returnedFragment.id}`);
      const successResponse = createSuccessResponse({
        fragments: { metaDataFragment, formats: metaDataFragment.formats },
      });
      // res.setData('fragments', metaDataFragment.formats);
      return res.status(200).json(successResponse);
    } else {
      return res
        .status(400)
        .json(
          createErrorResponse(
            400,
            'requested data type should be match with existing fragment data type'
          )
        );
    }
  } catch (err) {
    return res
      .status(420)
      .json(createErrorResponse(420, 'error catched while putting fragment from put'));
  }
};

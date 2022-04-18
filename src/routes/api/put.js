const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const API_URL = process.env.API_URL;
module.exports = async (req, res) => {
  try {
    let metaDataFragment = await Fragment.byId(req.user, req.params.id);
    logger.debug(req.headers['content-type']);

    if (metaDataFragment.type == req.headers['content-type']) {
      await metaDataFragment.setData(req.body);

      const returnedFragment = await Fragment.byId(req.user, req.params.id);

      res.setHeader('Location', `${API_URL}/v1/fragments/${req.params.id}`);

      const fragType = returnedFragment.formats;

      return res
        .status(200)
        .json(createSuccessResponse({ fragment: returnedFragment, type: fragType }));
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

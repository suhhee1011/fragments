// Use https://www.npmjs.com/package/nanoid to create unique IDs
const { nanoid } = require('nanoid');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data/index');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) {
      throw new Error('Owner id should be entered');
    } else if (!type) {
      throw new Error('Type should be entered');
    }
    if (typeof size !== 'number') {
      throw new Error('size should be a number');
    } else {
      if (size < 0) {
        throw new Error('Size cannot be negative');
      }
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error('This type is not supported');
    }

    this.id = id || nanoid();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    return new Fragment(await readFragment(ownerId, id));
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    if (!data) {
      throw new Error('No Buffer');
    }
    await this.save();
    this.size = Buffer.byteLength(data);
    return writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.type == 'text/plain' || this.type == 'text/plain; charset=utf-8';
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    if (this.type == 'text/plain' || this.type == 'text/plain; charset=utf-8') {
      return ['text/plain'];
    } else if (this.type == 'application/json' || this.type == 'text/plain; charset=utf-8') {
      return ['application/json'];
    } else if (this.type == 'text/markdown') {
      return ['text/markdown', 'text/html', 'text/plain'];
    } else if (this.type == 'text/html') {
      return ['text/html', 'text/plain'];
    }
    return [];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const typeArr = [
      'text/plain',
      'text/plain; charset=utf-8',
      'text/markdown',
      'text/html',
      'application/txt',
      'application/json',
      'application/json; charset=utf-8',
    ];
    for (let val of typeArr) {
      console.log(val);
      if (val == value) {
        return true;
      }
    }
    return false;
  }
}

module.exports.Fragment = Fragment;

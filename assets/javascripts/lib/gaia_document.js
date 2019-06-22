import { Random } from 'random-js'
import prettyBytes from 'pretty-bytes';

import { publicUserSession } from '../lib/blockstack_client'
import DocumentRemover from '../lib/document_remover'
import { privateUserSession } from '../lib/blockstack_client'
import Constants from '../lib/constants'
import DocumentUploader from '../lib/document_uploader';

const types = {
  image:   ['png', 'gif', 'jpg', 'jpeg', 'svg', 'tif', 'tiff', 'ico'],
  audio:   ['wav', 'aac', 'mp3', 'oga', 'weba', 'midi'],
  video:   ['avi', 'mpeg', 'mpg', 'mp4', 'ogv', 'webm', '3gp', 'mov'],
  archive: ['zip', 'rar', 'tar', 'gz', '7z', 'bz', 'bz2', 'arc'],
};

const version = 1;

function generateHash(length) {
  return new Random().string(length);
}

class GaiaDocument {
  static fromFile(file) {
    return new GaiaDocument({
      name: file.name,
      created_at: file.lastModifiedDate,
      size: file.size,
      content_type: file.type,
      file: file
    });
  }

  static fromGaia(raw) {
    return new GaiaDocument(
      Object.assign(raw, {
        name: raw.name || raw.url.split('/').pop(),
        created_at: new Date(raw.created_at)
      })
    );
  }

  constructor(fields = {}) {
    this.content_type = fields.content_type;
    this.created_at = fields.created_at;
    this.file = fields.file;
    this.id = fields.id;
    this.name = fields.name;
    this.size = fields.size;
    this.synced = !!fields.id;
    this.url = fields.url;
    this.version = fields.version || version;
  }

  delete() {
    return new DocumentRemover(this).remove();
  }

  getName() {
    return this.name;
  }

  getSizePretty() {
    return prettyBytes(this.size);
  }

  getType() {
    if (this._prettySize) { return this._prettySize; }

    for (var t in types) {
      if (types[t].includes(this.content_type)) {
        return this._prettySize = t;
      }
    }
    return this._prettySize = 'file';
  }

  async save() {
    const payload = this.serialize();
    payload.file = this.file;
    payload.id = this.id || generateHash(6);
    payload.url = this.url || `${generateHash(14)}/${this.name}`;
    payload.content_type = this.content_type || this.name.split('.').pop();
    payload.created_at = new Date();

    const documentUploader = new DocumentUploader(payload)
    await documentUploader.upload();

    return Object.assign(this, payload);
  }

  serialize() {
    return {
      content_type: this.content_type || null,
      created_at: this.created_at || null,
      id: this.id || null,
      url: this.url || null,
      size: this.size || null,
      version: this.version || null
    };
  }

  shareUrl() {
    let username = privateUserSession.loadUserData().username;
    username = username.replace('.id.blockstack', '');
    return `${Constants.SHARE_URI}/${username}/${this.id}`;
  }

  toJSON() {
    return this.serialize();
  }
}

export default GaiaDocument;

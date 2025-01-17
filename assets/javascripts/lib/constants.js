function isPreview() {
 return __PREVIEW__;
}

function isProduction() {
 return process.env.NODE_ENV === 'production';
}

let BLOCKSTACK_ORIGIN = window.location.origin;
let SHARE_URI = window.location.origin + '/d';
if (isProduction() && !isPreview()) {
  BLOCKSTACK_ORIGIN = 'https://envelop.app';
  SHARE_URI = 'https://envl.app';
}

function redirectUri(suffix) {
  return BLOCKSTACK_ORIGIN + suffix;
}

const Constants = {
  BLOCKSTACK_ORIGIN: BLOCKSTACK_ORIGIN,
  BLOCKSTACK_REDIRECT_URI: isProduction() ? redirectUri('/app') : redirectUri('/app.html'),
  SHARE_URI: SHARE_URI,
  PREVIEW: __PREVIEW__,
  FILE_SIZE_LIMIT: 25000000,
  TEMP_DOCUMENTS_PREFIX: 'tempDocuments'
};

export default Constants;

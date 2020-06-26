const path = require('path');
const os = require('os');

const APP_NAME = 'ImageShrink';
const APP_PATH = path.join(os.homedir(), APP_NAME);
module.exports = {
	APP_NAME,
	APP_PATH,
};

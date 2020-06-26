const path = require('path');
const os = require('os');
const { ipcRenderer } = require('electron');
const { APP_PATH } = require('../config');
// const M = require('materialize-css');
document.getElementById('output-path').innerText = APP_PATH;

const form = document.getElementById('image-form');
const img = document.getElementById('img');
const slider = document.getElementById('slider');

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const imgPath = img.files[0].path;
	const quality = slider.value;
	ipcRenderer.send('image:minimize', {
		imgPath,
		quality,
	});
});

ipcRenderer.on('image:done', (event, info) => {
	console.log({ info });

	M.toast({ html: `Image was reduced from ${info.fileSize} to ${info.newFileSize}`, displayLength: 10000 });
});

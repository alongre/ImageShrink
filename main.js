const path = require('path');
const os = require('os');
const fs = require('fs');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const { APP_PATH } = require('./config');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');
const filesize = require('filesize');

process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

console.log(process.platform);

let mainWindow;
let aboutWindow;

function createMainWindow() {
	mainWindow = new BrowserWindow({
		title: 'ImageShrink',
		width: isDev ? 800 : 500,
		height: 600,
		icon: './assets/icons/Icon_256x256.png',
		resizable: isDev,
		backgroundColor: 'white',
		webPreferences: {
			nodeIntegration: true,
		},
	});

	if (isDev) {
		mainWindow.webContents.openDevTools();
	}

	mainWindow.loadFile('./app/index.html');
	// mainWindow.loadURL(`file://${__dirname}/app/index.html`);
}

function createAboutWindow() {
	aboutWindow = new BrowserWindow({
		title: 'About ImageShrink',
		width: 300,
		height: 300,
		icon: './assets/icons/Icon_256x256.png',
		resizable: false,
		backgroundColor: 'white',
	});

	aboutWindow.loadFile('./app/about.html');
}

function getFileSize(filename) {
	var stats = fs.statSync(filename);
	var fileSizeInBytes = stats['size'];
	return filesize(fileSizeInBytes);
}

ipcMain.on('image:minimize', (e, options) => {
	const fSize = getFileSize(options.imgPath);
	const customOptions = {
		...options,
		destination: APP_PATH,
		fileSize: fSize,
	};
	shrinkImage(customOptions);
});

async function shrinkImage({ imgPath, quality, destination, fileSize }) {
	try {
		const files = await imagemin([slash(imgPath)], {
			destination,
			plugins: [imageminMozjpeg({ quality }), imageminPngquant({ quality: [quality / 100, quality / 100] })],
		});
		shell.showItemInFolder(destination);
		const destinationPath = file.length > 0 && files[0].destinationPath;
		const newFileSize = destinationPath ? getFileSize(files[0].destinationPath) : 0;
		mainWindow.webContents.send('image:done', { fileSize, newFileSize });
	} catch (error) {
		console.log(error);
	}
}

app.on('ready', () => {
	createMainWindow();
	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	// globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload());
	// globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I', () => mainWindow.toggleDevTools());

	mainWindow.on('ready', () => (mainWindow = null));
});

const menu = [
	...(isMac
		? [
				{
					label: app.name,
					submenu: [
						{
							label: 'About',
							click: createAboutWindow,
						},
					],
				},
		  ]
		: []),
	{
		role: 'fileMenu',
	},
	...(isDev
		? [
				{
					label: 'Developer',
					submenu: [{ role: 'reload' }, { role: 'forcereload' }, { role: 'seperator' }, { role: 'toggledevtools' }],
				},
		  ]
		: []),
];

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (!isMac) {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

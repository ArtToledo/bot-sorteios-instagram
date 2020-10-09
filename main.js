const { app, BrowserWindow, ipcMain } = require('electron');

var CronJob = require('cron').CronJob;
const puppeteer = require('puppeteer');

// variaveis para funcionamento do electron
var win;

// variaveis de controle do sistema
var totalComentarios = 0;
var login;
var password;
var perfis;
var urlSorteio;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Ganhador de Sorteios',
    resizable: false,
    icon: __dirname + '/assets/icon/icon_16x16.png' ,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.removeMenu();
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  };
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  };
});

ipcMain.on('activeSystem', (event, arg) => {
  const { loginInput, passwordInput, perfisInput, urlSorteioInput } = arg;
  login = loginInput;
  password = passwordInput;
  perfis = perfisInput;
  urlSorteio = urlSorteioInput;

  job.start();
});

ipcMain.on('cancelSystem', (event, arg) => {
  job.stop();
});

var job = new CronJob('*/2 * * * *', function() {
  commentInstagram(login, password, perfis, urlSorteio);
});

const commentInstagram = async (login, password, perfis, urlSorteio) => {
  // Starting browser
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  // Login flow
  await page.goto('https://www.instagram.com/accounts/login/?source=auth_switcher');
  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', login);
  await page.type('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Waiting for page to refresh
  await page.waitForNavigation();

  // Navigate to post and submitting the comment
  await page.goto(urlSorteio);
  await page.waitForSelector('textarea');
  await page.type('textarea', perfis);

  await page.click('button[type="submit"]');

  await browser.close();

  totalComentarios += 1;
  win.webContents.send('comentarioFinalizado', totalComentarios);
};
const { app, BrowserWindow, ipcMain } = require('electron');

var CronJob = require('cron').CronJob;
const puppeteer = require('puppeteer');

// variaveis para funcionamento do electron
var win;
// variaveis de controle do sistema
var totalComentarios = 0, login, password, perfis, urlSorteio, typeRaffleMarked;

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
  const { loginInput, passwordInput, perfisInput, urlSorteioInput, typeRaffle } = arg;
  login = loginInput;
  password = passwordInput;
  perfis = perfisInput;
  urlSorteio = urlSorteioInput;
  typeRaffleMarked = typeRaffle;

  job.start();
});

ipcMain.on('cancelSystem', (event, arg) => {
  job.stop();
});

var job = new CronJob('*/2 * * * *', function() {
  if (typeRaffleMarked === 'markedPeoples') {
    commentInstagramProfilesMarked(login, password, perfis, urlSorteio);
  } else {
    commentInstagramRandomWords(login, password, urlSorteio);
  }
});

const commentInstagramRandomWords = async (login, password, urlSorteio) => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  await page.goto('https://www.palavrasque.com/palavra-aleatoria.php?Submit=Nova+palavra');

  const element = await page.$("b");
  const text = await page.evaluate(element => element.textContent, element);

  await page.goto('https://www.instagram.com/accounts/login/?source=auth_switcher');
  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', login);
  await page.type('input[name="password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForNavigation();

  await page.goto(urlSorteio);
  await page.waitForSelector('textarea');
  await page.type('textarea', text);

  await page.click('button[type="submit"]');

  setTimeout(async () => {
    await browser.close();
  }, 10000);

  totalComentarios += 1;
  win.webContents.send('comentarioFinalizado', totalComentarios);
};

const commentInstagramProfilesMarked = async (login, password, perfis, urlSorteio) => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  await page.goto('https://www.instagram.com/accounts/login/?source=auth_switcher');
  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', login);
  await page.type('input[name="password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForNavigation();

  await page.goto(urlSorteio);
  await page.waitForSelector('textarea');
  await page.type('textarea', perfis);

  await page.click('button[type="submit"]');

  setTimeout(async () => {
    await browser.close();
  }, 10000);

  totalComentarios += 1;
  win.webContents.send('comentarioFinalizado', totalComentarios);
};

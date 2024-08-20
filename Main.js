const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  shell,
  Notification,
} = require("electron");
const fs = require("fs");
const os = require("os");
const path = require("path");
const resizeImg = require("resize-img");
const isMac = process.platform == "darwin";
let mainWin;

const createMainWindow = () => {
  mainWin = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Modi",
    fullscreenable: true,
    focusable: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  mainWin.loadFile("./Renderer/index.html");
  mainWin.once("ready-to-show", () => {
    mainWin.show();
  });
  //remove mainWindow from memory after closing
  mainWin.on("closed", () => {
    mainWin = null;
  });
};

app.whenReady().then(() => {
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

//menu template
const template = [
  {
    label: "Application",
    submenu: [
      isMac ? { role: "close" } : { role: "quit" },
      { role: "togglefullscreen" },
      { type: "separator" },
      { role: "zoomIn" },
      { role: "zoomOut" },
    ],
  },
  {
    label: "About",
    submenu: [
      {
        label: "About Modi",
        click: () => {
          const win = new BrowserWindow({
            width: 300,
            height: 300,
            title: "About Modi",
            fullscreenable: false,
            maximizable: false,
            focusable: true,
            hasShadow: true,
            webPreferences: {
              preload: path.join(__dirname, "preload.js"),
            },
          });
          win.loadFile("./Renderer/about.html");
          win.once("ready-to-show", () => {
            win.show();
            app.setAppUserModelId("Modi");
          });
        },
      },
    ],
  },
  {
    role: "Help",
    submenu: [
      {
        label: "Learn about Modi",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://electronjs.org");
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

ipcMain.on("sent-from-renderer", async (event, data) => {
  try {
    const imgW = data.width;
    const imgH = data.height;
    const savedDir = path.join(os.homedir(), "Modi");
    const resizedImg = await resizeImg(fs.readFileSync(data.imgPath), {
      width: +imgW,
      height: +imgH,
    });
    console.log(resizedImg, "rrrrrrrrrr");
    console.log(savedDir);
    dialog
      .showSaveDialog({
        title: "Select directory to save",
        defaultPath: savedDir,
        buttonLabel: "Save",
        filters: [
          {
            name: "Image",
            extensions: ["gif", "jpg", "png"],
          },
        ],
        properties: [
          { dontAddToRecent: true, showOverwriteConfirmation: true },
        ],
      })
      .then((file) => {
        console.log(file.canceled);
        if (!file.canceled) {
          const savedFilePath = file.filePath;
          mainWin.webContents.send("received-from-main", savedFilePath);
          shell.openPath(file.filePath.toString());
          fs.writeFile(file.filePath.toString(), resizedImg, function (err) {
            if (err) throw err;
            console.log("Saved!");
          });
          //pop notification
          new Notification({
            title: "Thanks for using Modi!",
            subtitle: "Hope you enjoyed the service 🙂",
            body: `Your image has been stored at: s${savedFilePath} `,
            // silent: false,
            // hasReply: true,
            // timeoutType: "never",
            // replyPlaceholder: "Drop a feedback...",
            // sound: Api.join("C:/Users/Oluwaloju/Modi", "../Assets/notify.mp3"),
            // urgency: "critical",
          }).show();
          console.log("hi");
        }
      })
      .catch((e) => console.log(e, "Error writing file to dir"));
  } catch (error) {
    console.log(error);
  }
});

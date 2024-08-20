const {
  contextBridge,
  ipcRenderer,
  ipcMain,
  Notification,
} = require("electron");
const os = require("os");
const path = require("path");
const Toastify = require("toastify-js");

contextBridge.exposeInMainWorld("Api", {
  homedir: () => os.homedir(),
  join: (...args) => path.join(...args),
  toastify: (options) => Toastify(options).showToast(),
  // notify: (options) => {
  //   let noti = new Notification({
  //     title: "Thanks for using Modi!",
  //     subtitle: "Hope you enjoyed the service 🙂",
  //     body: `Your image has been stored at: ${value} `,
  //     silent: false,
  //     hasReply: true,
  //     timeoutType: "never",
  //     replyPlaceholder: "Drop a feedback...",
  //     sound: Api.join("C:/Users/Oluwaloju/Modi", "../Assets/notify.mp3"),
  //     urgency: "critical",
  //   }).show();
  //   return noti;
  // },
});

contextBridge.exposeInMainWorld("ipc", {
  send: (data) => ipcRenderer.send("sent-from-renderer", data),
  on: (callback) => {
    ipcRenderer.on("received-from-main", (_event, value) => callback(value));
  },
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
let GLOBAL_SCOPE = this;

const FXA_NS = "FxAcctNS";
const FXA_LABEL = "Firefox Account";
const fxacctId = "menu_ToolsFxAcctItem";

function install(aData, aReason) {}

// Setup (startup, enable, install): insert add-on into browser UI, register any
// listeners, etc
function startup(aData, aReason) {
  Cu.import("resource://gre/modules/Services.jsm");
  Services.scriptloader.loadSubScript(aData.resourceURI.spec + "modules/main.js", GLOBAL_SCOPE);
  dump("creating fx account\n");
  this.fxAccount = FxAccount();
  dump("set fxAccount\n");
  installOnStartup();
}

function installOnStartup() {
  // Add menu-item to existing windows.
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"]
             .getService(Ci.nsIWindowMediator);
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    addToWindow(domWindow);
    // TODO: [optional] Add menu item for Win7 windows.
  }
  wm.addListener(this.newWindowListener);
}

// Window listener for new windows.
this.newWindowListener = {
  onOpenWindow: function(win) {
    let domWindow = win.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      addToWindow(domWindow);
    }, false);
  },
  onCloseWindow: function(win) {},
  onWindowTitleChange: function(win, title) {}
};

// Add Firefox Account menu item to a window.
function addToWindow(win) {
  dump("INFO: function addToWindow\n");
  let fxAcctMI= win.document.createElementNS(FXA_NS, "menuitem");
  // TODO: Display different text based on account existence.
  fxAcctMI.setAttribute("label", FXA_LABEL);
  fxAcctMI.setAttribute("id", fxacctId);
  fxAcctMI.addEventListener("command", this.fxAccount.main, true);
  dump("accountExists? ");
  dump(this.fxAccount.accountExists + "\n");
  win.document.getElementById("menu_ToolsPopup").insertBefore(fxAcctMI, win.document.getElementById("devToolsSeparator"));
}

function shutdown(aData, aReason) {
  dump("INFO: Shutting down FxAcct add-on!\n");
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;

  // Removal clean-up (disable, uninstall): remove elements from browser, unregister
  // any listeners, etc.
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"]
             .getService(Ci.nsIWindowMediator);
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
  wm.removeListener(this.newWindowListener);
}

function unloadFromWindow(win) {
  let menuItem = win.document.getElementById(fxacctId);
  menuItem && menuItem.parentNode.removeChild(menuItem);
}

function uninstall(aData, aReason) {}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Cc = Components.classes;
const Ci = Components.interfaces;
const NS_FXACCT = "FxAcctNS";

const fxacctId = "menu_ToolsFxAcctItem";

function install(aData, aReason) {}

// Window listener for new windows.
let windowListener = {
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

// Setup (startup, enable, install): insert add-on into browser UI, register any
// listeners, etc.
function startup(aData, aReason) {
  // Add menu-item to existing windows.
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"]
             .getService(Ci.nsIWindowMediator);
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    addToWindow(domWindow);
    // TODO: [optional] Add menu item for Win7 windows.
  }
  wm.addListener(windowListener);
}

// Add Firefox Account menu item to a window.
function addToWindow(win) {
  dump("INFO: function addToWindow\n");
  let fxAcctMI= win.document.createElementNS(NS_FXACCT, "menuitem");
  // TODO: Display different text based on account existence.
  fxAcctMI.setAttribute("label", "Firefox Account");
  fxAcctMI.setAttribute("id", fxacctId);
  // TODO: Hook up chrome tab launch-js.
  fxAcctMI.addEventListener("command", setup_account, true);
  win.document.getElementById("menu_ToolsPopup").insertBefore(fxAcctMI, win.document.getElementById("devToolsSeparator"));
}

// Basic chrome window.
// TODO: Pull out of bootstrap.js.
// TODO: Make into a chrome tab.
// TODO: Single instance? Allow multiple sign-in tabs/windows?
function setup_account() {
  dump("INFO: function setup_account\n");
  let ww = Cc["@mozilla.org/embedcomp/window-watcher;1"]
             .getService(Components.interfaces.nsIWindowWatcher);
  let win = ww.openWindow(null, "chrome://fxacct/content/sign-in.xhtml", null, null, null);
}

function shutdown(aData, aReason) {
  dump("INFO: Shutting down FxAcct add-on!\n");
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;

  // Clean-up (shutdown, disable, uninstall): remove elements from browser, unregister
  // any listeners, etc.
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"]
             .getService(Ci.nsIWindowMediator);
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
  wm.removeListener(windowListener);
}

function unloadFromWindow(win) {
  let menuItem = win.document.getElementById(fxacctId);
  menuItem && menuItem.parentNode.removeChild(menuItem);
}

function uninstall(aData, aReason) {}

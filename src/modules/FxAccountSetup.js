/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

this.EXPORTED_SYMBOLS = ['FxAccountSetup', 'main'];
const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

// Page constants.
const INIT_SIGNIN = 0;
const BASIC_SIGNIN = 1;
const ADV_SIGNIN = 2;
const SUCCESS_PAGE = 3;
const CREATE_PAGE = 4;
const CONFIRM_PAGE = 5;

const pageIds = ["InitialSigninPage", "BasicSigninPage", "AdvancedSigninPage", "SuccessPage", "CreateAccountPage", "ConfirmAccountPage"];

let window;
let fxAccountSetup;

function main() {
  dump("main()\n");
  // Launch FxAccount Sign-In screen.
  window = openAndReuseOneTab("chrome://fxacct/content/sign-in.xul");
  dump("new fxAccountSetup\n");
  fxAccountSetup = new FxAccountSetup();
  fxAccountSetup.initListeners(window);
}

this.FxAccountSetup = function FxAccountSetup() {
  this.window = null;
  this.currentPage = null;
}

FxAccountSetup.prototype = {
  initListeners: function init(window) {
    dump("initListeners()\n");
    this.window = window;
    this.window.gBrowser.addEventListener("load", function() {
      dump("loaded!\n");
    });
    dump("document: " + this.window.document + "\n");
    _addListeners(this.window);
  },
  _addListeners: function _addListeners(win) {
    win.addEventListener("
  },
  onclick: function onclick(event) {
    dump("received onClick!\n");
  },
  signIn: function signIn() {
    dump("signin()\n");
    this._showPage(BASIC_SIGNIN);
  },
  newAccount: function newAccount() {
    dump("newAccount()\n");
    dump(this.document.getElementById(pageIds[BASIC_SIGNIN]).collapsed);
    this._showPage(CREATE_PAGE);
  },
  _showPage: function _showPage(index) {
    this.currentPage.collapsed = true;
    this.currentPage = this.document.getElementById(pageIds[index]);
    this.currentPage.collapsed = false;
  },
  test: function test() {
    dump("test\n");
  }
};

/**
 * Reuse tab containing the URL if it exists; otherwise, open in a new tab.
 * Returns the browser window containing new tab, or null if no windows exist.
 */
function openAndReuseOneTab(url) {
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"]
             .getService(Ci.nsIWindowMediator);
  let browserEnumerator = wm.getEnumerator("navigator:browser");

  // Check each browser instance for our URL
  let found = false;
  while (!found && browserEnumerator.hasMoreElements()) {
    let browserWin = browserEnumerator.getNext();
    let tabbrowser = browserWin.gBrowser;
    // Check each tab of this browser instance
    let numTabs = tabbrowser.browsers.length;
    for (let index = 0; index < numTabs; index++) {
      let currentBrowser = tabbrowser.getBrowserAtIndex(index);
      if (url == currentBrowser.currentURI.spec) {
        // The URL is already opened. Select this tab.
        tabbrowser.selectedTab = tabbrowser.tabContainer.childNodes[index];
        // Focus *this* browser-window
        browserWin.focus();
        found = true;
        dump("found tab - opening\n");
        dump("browserWin " + browserWin + "\n");
        return browserWin;
      }
    }
  }
  // Our URL isn't open. Open it now.
  if (!found) {
    let recentWindow = wm.getMostRecentWindow("navigator:browser");
    if (recentWindow) {
      // Use an existing browser window
      recentWindow.delayedOpenTab(url, null, null, null, null);
      dump("recentWindow ");
      dump(recentWindow + "\n");
      return recentWindow;
    }
    else {
      // TODO: No browser windows are open, so open a new one.
      // Can't do this in an extension, because the FxAccount menu item
      // entry point is added to browser windows. No window = no menu item.
      dump("no windows open.\n");
    }
  }
  return null;
}

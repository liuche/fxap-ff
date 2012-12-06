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

const flowGraph = {"buttonNewAccount" : CREATE_PAGE,
                   "buttonExistingAcount" : BASIC_SIGNIN,
                   "linkAdvSignin" : ADV_SIGNIN,
                   "buttonSignIn" : 3,
                   "linkForgotPassword" : 0,
                   "linkCreateAccount" : CREATE_PAGE,
                   "buttonSigninAdv" : ADV_SIGNIN,
                   "buttonSignout" : 0,
                   "linkSignIn" : BASIC_SIGNIN,
                   "buttonCreate" : CONFIRM_PAGE
                  };

let window;
let fxAccountSetup;

function main() {
  dump("new fxAccountSetup\n");
  // Launch FxAccount Sign-In screen.
  window = openAndReuseOneTab("chrome://fxacct/content/sign-in.xul");
  fxAccountSetup = new FxAccountSetup();
  fxAccountSetup.initListeners(window);
}

this.FxAccountSetup = function FxAccountSetup() {
  this.window = null;
  this.selectedTab = null;
  this.currentPage = null;
};

FxAccountSetup.prototype = {
  init: function init(window) {
    this.window = window;
    this.addListeners();
  },
  onPageLoaded: function onPageLoaded(aEvent) {
    dump("onload callback\n");
    // Set current page.
    dump("testing window doc: " + window.gBrowser.contentDocument + "\n");
    this.currentPage = window.gBrowser.contentDocument.getElementById(pageIds[0]);
    this.selectedTab = window.gBrowser.selectedTab;
    dump("currentPage: " + this.currentPage + "\n");
    dump("selectedTab:" + this.selectedTab + "\n");
    dump("onLoad done\n");
  },
  addListeners: function addListeners() {
    dump("initListeners()\n");
    window.gBrowser.selectedTab.addEventListener("pageshow", this.onPageLoaded.call(this), false);
    dump("done\n");
  },
  onclick: function onclick(element) {
    dump(element.id + "clicked!\n");
    let doc = window.gBrowser.contentDocument;
    dump("contentDoc: " + doc + "\n");
  },
  signIn: function signIn(element) {
    dump("signin() ");
    dump(element.getAttribute("id") + "\n");
    dump("dumped\n");
    this._displayPage(BASIC_SIGNIN);
  },
  newAccount: function newAccount(event) {
    dump("newAccount() ");
    dump(event.name + "\n");
    dump("dumped\n");
    dump(this.document.getElementById(pageIds[BASIC_SIGNIN]).collapsed);
    this._displayPage(CREATE_PAGE);
  },
  _displayPage: function _displayPage(index) {
    // hack - onload and pageshow callbacks fire before elements are created.
    if (this.currentPage == null) {
     this.currentPage = window.gBrowser.contentDocument.getElementById(pageIds[0]);
    }
    dump("getting " + pageIds[index] + "\n");
    this.currentPage.collapsed = true;
    this.currentPage = window.gBrowser.contentDocument.getElementById(pageIds[index]);
    this.currentPage.collapsed = false;
    dump("showing page " + index + "\n");
  },
};
function test() {
  dump("calling test() function\n");
}
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

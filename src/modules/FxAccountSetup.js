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
                   "buttonExistingAccount" : BASIC_SIGNIN,
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
  Cu.import("resource://fxacct/modules/utils.js");
  // Launch FxAccount Sign-In screen.
  debug("opening tab");
  window = openAndReuseOneTab("chrome://fxacct/content/sign-in.xul");
  debug("new fxAccountSetup");
  fxAccountSetup = new FxAccountSetup();
  fxAccountSetup.addListeners(window);
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
    debug("onload callback");
    // Set current page.
    debug("testing window doc: " + window.gBrowser.contentDocument);
    this.currentPage = window.gBrowser.contentDocument.getElementById(pageIds[0]);
    this.selectedTab = window.gBrowser.selectedTab;
    debug("currentPage: " + this.currentPage);
    debug("selectedTab:" + this.selectedTab);
    debug("onLoad done");
  },
  addListeners: function addListeners() {
    debug("initListeners()");
    window.gBrowser.selectedTab.addEventListener("pageshow", this.onPageLoaded.call(this), false);
    debug("done");
  },
  onclick: function onclick(element) {
    debug(element.id + "clicked!");
    let doc = window.gBrowser.contentDocument;
    debug("contentDoc: " + doc);
    this._advance(element.id);
  },
  _advance: function _advance(elementid) {
    debug("advancing from " + elementid);
    // TODO: handle validation, additional behavior between pages.
    if (!flowGraph[elementid]) {
      debug("cannot advance - property doesn't exist!");
      return;
    }
    debug("displaying " + flowGraph[elementid]);
    this._displayPage(flowGraph[elementid]);
  },
  _displayPage: function _displayPage(index) {
    // hack - onload and pageshow callbacks fire before elements are created.
    if (this.currentPage == null) {
     this.currentPage = window.gBrowser.contentDocument.getElementById(pageIds[0]);
    }
    debug("getting " + pageIds[index]);
    this.currentPage.collapsed = true;
    this.currentPage = window.gBrowser.contentDocument.getElementById(pageIds[index]);
    this.currentPage.collapsed = false;
    debug("showing page " + index);
  },
};
function test() {
  debug("calling test() function");
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
        debug("found tab - opening");
        debug("browserWin " + browserWin);
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
      debug("recentWindow");
      debug(recentWindow);
      return recentWindow;
    }
    else {
      // TODO: No browser windows are open, so open a new one.
      // Can't do this in an extension, because the FxAccount menu item
      // entry point is added to browser windows. No window = no menu item.
      debug("no windows open.");
    }
  }
  return null;
}

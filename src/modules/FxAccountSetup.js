/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

this.EXPORTED_SYMBOLS = ['FxAccountSetup', 'main'];
const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

// Page constants.
const INIT_SIGNIN  = 0;
const BASIC_SIGNIN = 1;
const ADV_SIGNIN   = 2;
const SUCCESS_PAGE = 3;
const CREATE_PAGE  = 4;
const CONFIRM_PAGE = 5;

const pageIds = ["InitialSigninPage", "BasicSigninPage", "AdvancedSigninPage", "SuccessPage", "CreateAccountPage", "ConfirmAccountPage"];

const flowGraph = {"buttonNewAccount" : CREATE_PAGE,
                   "buttonExistingAccount" : BASIC_SIGNIN,
                   "linkAdvSignin" : ADV_SIGNIN,
                   "buttonSignIn" : 3,
                   "buttonSignInAdv" : 0,
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
  fxAccountSetup.initialize();
}

this.FxAccountSetup = function FxAccountSetup() {
  this.selectedTab = null;
  this.currentPage = null;
};

FxAccountSetup.prototype = {
  initialize: function initialize(window) {
    this.addListeners();
    // Add listeners.
    let self = this;
    window.gBrowser.selectedTab.addEventListener("onload", function onLoad(self) {
      debug("onload callback");
      // Set current page.
      // TODO: why is element still null after onload?
      self.currentPage = this.getElement(pageIds[0]);
      debug("currentPage:" + self.currentPage);
      self.selectedTab = window.gBrowser.selectedTab;
      debug("onLoad done");
    }, false);
  },

  advance: function advance(elementid) {
    debug("advancing from " + elementid);
    // TODO: handle validation, additional behavior between pages.
    debug(flowGraph[elementid]);
    if (flowGraph[elementid] == null) {
      debug("cannot advance - property doesn't exist!");
      return;
    }
    // TODO: handle history
    debug("displaying " + flowGraph[elementid]);
    // TODO: add validation listeners, remove previous listeners?
    this._displayView(flowGraph[elementid]);
  },

  _displayView: function _displayView(index) {
    debug("getting " + pageIds[index]);
    this.currentPage.collapsed = true;
    this.currentPage = this.getElement(pageIds[index]);
    this.currentPage.collapsed = false;
    debug("showing page " + index);
  },

  // Listeners.
  onClick: function onClick(element) {
    debug(element.id + " clicked!");

    // hack - onload and pageshow callbacks fire before elements are created.
    if (this.currentPage == null) {
     this.currentPage = this.getElement(pageIds[0]);
    }

    let pageId = pageIds.indexOf(this.currentPage.id);
    let usernameField;
    let passwordField;

    switch(pageId) {
      case BASIC_SIGNIN:
        debug("basic signin");
        usernameField = this.getElement("input-email-basic");
        passwordField = this.getElement("input-password-basic");
        // Do something with the fields.
        debug(usernameField.value);
        debug(passwordField.value);
        // Clear fields.
        usernameField.value = "";
        passwordField.value = "";
        break;

      case ADV_SIGNIN:
        debug("adv signin");
        usernameField = this.getElement("input-email-adv");
        passwordField = this.getElement("input-password-adv");
        // Do something with the fields.
        debug(usernameField.value);
        debug(passwordField.value);
        // Clear fields.
        usernameField.value = "";
        passwordField.value = "";
        break;

      case CREATE_PAGE:
        debug("create page");
        usernameField = this.getElement("input-email-create");
        passwordField = this.getElement("input-password-create");
        // Do something with the fields.
        debug(usernameField.value);
        debug(passwordField.value);
        // Clear fields.
        usernameField.value = "";
        passwordField.value = "";
        this.getElement("input-password-confirm").value = "";
        break;

      case SUCCESS_PAGE: // Do nothing.
      default:
        debug("nothing to be done");
    }

    this.advance(element.id);
  },
  getElement: function getElement(id) {
    return window.gBrowser.contentDocument.getElementById(id);
  },
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

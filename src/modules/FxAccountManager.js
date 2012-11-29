/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

this.EXPORTED_SYMBOLS = ['FxAccountManager'];
const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

// Page constants.
const INIT_SIGNIN  = 0;
const BASIC_SIGNIN = 1;
const ADV_SIGNIN   = 2;
const SUCCESS_PAGE = 3;
const CREATE_PAGE  = 4;
const CONFIRM_PAGE = 5;

const pageIds = ["InitialSigninPage", "BasicSigninPage", "AdvancedSigninPage", "SuccessPage", "CreateAccountPage", "ConfirmAccountPage"];

this.FxAccountManager = function FxAccountManager() {
  // Hack to get window.
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"]
             .getService(Ci.nsIWindowMediator);
  this.document = wm.getMostRecentWindow("navigator:browser").document;
  this.currentPage = null;
}
FxAccountManager.prototype = {
  init: function init() {
    dump("init()\n");
    dump("this.doc " + this.document + "\n");
    this.currentPage = this.document.getElementById(pageIds[0]);
    dump("page: " + this.currentPage + "\n");
    dump("init finished\n");
  },
  signIn: function signIn() {
    dump("signin2()\n");
    this._showPage(BASIC_SIGNIN);
  },
  newAccount: function newAccount() {
    dump("newAccount2()\n");
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

this.EXPORTED_SYMBOLS = ['FxAccountManager', "signIn"];
const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

// Page constants.
const INIT_SIGNIN = 0;
const BASIC_SIGNIN = 1;
const ADV_SIGNIN = 2;
const SUCCESS_PAGE = 3;
const CREATE_PAGE = 4;
const CONFIRM_PAGE = 5;

const pageIds = ["InitialSigninPage", "BasicSigninPage", "AdvancedSigninPage", "SuccessPage", "CreateAccountPage", "ConfirmAccountPage"];

this.FxAccountManager = function FxAccountManager() {
  // TODO: load from prefs. Default to no account for now.
  this.accountExists = false;
  this.currentPage = null;
  dump("loaded\n");
}
FxAccountManager.prototype = {
  accountExists: false,
  signIn: function signIn(username, password) {
    // Verify with pIDP server.
    dump("signIn()\n");
  },
  newAccount: function newAccount(username, password) {
    // Create account with pIDP server.
    dump("newAccount()\n");
  },
  _showPage: function _showPage(index) {
    this.currentPage.collapsed = true;
    this.currentPage = document.getElementById(pageIds[index]);
    this.currentPage.collapsed = false;
  },
};

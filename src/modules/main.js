/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const EXPORTED_SYMBOLS = ['FxAccount', 'testFunction'];

let FxAccount = {
  accountExists: false, // TODO: can't be accessed??
  main: function() {
    dump("FxAccount.main\n");
    // Launch chrome for chrome tab.
    if (this.accountExists) {
      // Account management.
      dump("account exists\n");
    } else {
      dump("no account\n");
      // Account setup.
      let ww = Cc["@mozilla.org/embedcomp/window-watcher;1"]
               .getService(Components.interfaces.nsIWindowWatcher);
      let win = Cc["@mozilla.org/browser/browserglue;1"].getService(Ci.nsIBrowserGlue).getMostRecentBrowserWindow();
      win.openUILinkIn("chrome://fxacct/content/sign-in.xhtml", "tab", {});
    }
  }
};

function testFunction() {
  dump("testFunction\n");
}

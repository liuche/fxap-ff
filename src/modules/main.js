/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

this.EXPORTED_SYMBOLS = ['main'];
const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

function main() {
  // Launch FxAccount Sign-In screen.
  dump("main()\n");
  openAndReuseOneTab("chrome://fxacct/content/sign-in.xul");
}

/**
 * Reuse tab containing the URL if it exists; otherwise, open in a new tab.
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
        break;
      }
    }
  }

  // Our URL isn't open. Open it now.
  if (!found) {
    let recentWindow = wm.getMostRecentWindow("navigator:browser");
    if (recentWindow) {
      // Use an existing browser window
      recentWindow.delayedOpenTab(url, null, null, null, null);
    }
    else {
      // TODO: No browser windows are open, so open a new one.
      // Can't do this in an extension, because the FxAccount menu item
      // entry point is added to browser windows. No window = no menu item.
    }
  }
}

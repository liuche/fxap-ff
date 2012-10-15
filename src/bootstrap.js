/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Cc = Components.classes;
const Ci = Components.interfaces;

function install(aData, aReason) {}

function startup(aData, aReason) {
  // Setup (startup, enable, install): insert add-on into browser UI, register any
  // listeners, etc.
  dump("Starting up! Hello world!\n");
}

function shutdown(aData, aReason) {
  dump("Shutting down!\n");
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;

  // Clean-up (shutdown, disable, uninstall): remove elements from browser, unregister
  // any listeners, etc.
}

function uninstall(aData, aReason) {}

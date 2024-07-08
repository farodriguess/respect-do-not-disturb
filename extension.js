"use strict";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as MessageTray from "resource:///org/gnome/shell/ui/messageTray.js";

import * as Common from "./common.js";

const NOTIFICATION_SETTINGS = "org.gnome.desktop.notifications";
let notificationEnabled = true;
let block_all = false;
let block_application_list = [];

export default class RespectDDMExtension extends Extension {
  enable() {
    this._notificationSettings = this.getSettings(NOTIFICATION_SETTINGS);
    this._notificationSettingsConnectId = this._notificationSettings.connect(
      "changed",
      () => {
        this._readNotificationSettings();
      }
    );

    this._settings = this.getSettings();
    this._settigsConnectId = this._settings.connect("changed", () =>
      this._readSettings()
    );

    // Override the _updateState() function in MessageTray.
    MessageTray.MessageTray.prototype._updateStateOriginal =
      MessageTray.MessageTray.prototype._updateState;
    MessageTray.MessageTray.prototype._updateState = customUpdateState;

    this._readSettings();
    this._readNotificationSettings();
  }

  disable() {
    this._notificationSettings.disconnect(this._notificationSettingsConnectId);
    this._notificationSettings = null;
    this._notificationSettingsConnectId = null;
    this._settings.disconnect(this._settigsConnectId);
    this._settings = null;
    this._settigsConnectId = null;
    // Revert to original updateState function.
    MessageTray.MessageTray.prototype._updateState =
      MessageTray.MessageTray.prototype._updateStateOriginal;
    delete MessageTray.MessageTray.prototype._updateStateOriginal;
    block_application_list = null;
  }

  _readNotificationSettings() {
    if (this._notificationSettings) {
      notificationEnabled =
        this._notificationSettings.get_boolean("show-banners");
    }
  }

  _readSettings() {
    if (this._settings) {
      block_all = this._settings.get_boolean(Common.BLOCK_ALL_SETTINGS);
      block_application_list = this._settings
        .get_strv(Common.APPLICATION_BLOCK_LIST_SETTINGS)
        .filter((app) => !!app);
    }
  }
}

const customUpdateState = function () {
  // Setup variables.
  let changed = false;

  if (!notificationEnabled) {
    this._notificationQueue
      .filter((notification) => {
        if (block_all) {
          return true;
        }
        let found = block_application_list.find(
          (atest) => atest === notification.source?.title
        );
        return !!found;
      })
      .forEach((notification) => {
        changed = true;
        notification.acknowledged = true;
      });
  }

  if (changed) {
    this.emit("queue-changed");
  }

  // Calls the original _updateState, to handle showing the notifications.
  this._updateStateOriginal();
};

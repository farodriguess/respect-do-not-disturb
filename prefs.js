"use strict";

import Gio from "gi://Gio";
import Adw from "gi://Adw";
import GLib from "gi://GLib";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import * as Common from "./common.js";

export default class RespectDDMPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    let settings = this.getSettings();

    // Create a preferences page, with a single group
    const page = new Adw.PreferencesPage({
      title: _("General"),
      icon_name: "dialog-information-symbolic",
    });
    window.add(page);

    const group = new Adw.PreferencesGroup({
      title: _("Ignore All"),
      description: _(
        'Configure global blocking of urgent notifications when "Do not disturb" on.'
      ),
    });
    page.add(group);

    // Create a new preferences row
    const row = new Adw.SwitchRow({
      title: _("Enabled"),
      subtitle: _("Block all urgent notifications"),
    });
    group.add(row);

    // Create a settings object and bind the row to the `show-indicator` key
    window._settings = settings;
    window._settings.bind(
      "block-all",
      row,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );

    const applicationListGroup = new Adw.PreferencesGroup({
      title: _("Urgent notifications block List"),
      description: _("Ignore urgent notifications from specific apps"),
    });
    page.add(applicationListGroup);

    let values = settings.get_strv(Common.APPLICATION_BLOCK_LIST_SETTINGS);

    for (let x = 0; x < Common.MAX_FILTERS; x++) {
      let applicationBlockEntryRow = new Adw.EntryRow({
        title: _("Application Source Name"),
        show_apply_button: true,
      });
      if (values[x] && values[x].toString().length > 0) {
        applicationBlockEntryRow.set_text(values[x].toString());
      }
      applicationBlockEntryRow.connect("apply", () => {
        this._settingsChanged(applicationBlockEntryRow, x);
      });
      applicationListGroup.add(applicationBlockEntryRow);
    }
  }

  _settingsChanged(applicationBlockEntryRow, index) {
    let settings = this.getSettings();
    let values = settings.get_strv(Common.APPLICATION_BLOCK_LIST_SETTINGS);

    let actualValue = applicationBlockEntryRow.get_text().toString().trim();

    values[index] = actualValue;

    values = this._fillEmptySlotsWithEmpty(values);

    settings.set_value(
      Common.APPLICATION_BLOCK_LIST_SETTINGS,
      new GLib.Variant("as", values)
    );
    Gio.Settings.sync();
  }

  _fillEmptySlotsWithEmpty(arr) {
    return Array.from(arr, (_, i) => {
      if (!(i in arr)) return "";
      else return arr[i];
    });
  }
}

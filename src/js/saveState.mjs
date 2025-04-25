"use strict";

import { EventSystem } from "./utils.mjs";

export default class SaveState {

  #eventSystem = new EventSystem();

  // key = save file
  // subkey = individual data fields on a save

  #currentKey = null;       // current save file
  #currentSaveObject = {};  // all of its contents, key-value pairs accessed by this class's
                            // public get/set methods.

  // current save file name
  get user() {
    return this.#currentKey;
  }

  constructor() {
    this.#eventSystem.registerEvent("changed");

    // runs every page load, its job is to work out what current save we were actually using
    this.#currentKey = SaveState.#getActiveKey();
    this.load(this.#currentKey);
  }

  // events: "changed", runs whenever someone calls the load() function
  addEventListener(name, callback) {
    this.#eventSystem.addEventListener(name, callback);
  }

  // changes the current save file, will create a new one if it doesnt already exist
  load(key, blankSave={}) {
    this.#setCurrentKey(key);
    this.#currentSaveObject = SaveState.#load(this.#currentKey) ?? blankSave;

    this.#eventSystem.dispatchEvent("changed");
  }

  // gets a field from the current save file
  get(subkey) {
    return this.#currentSaveObject[subkey];
  }

  // sets a field on the current save file
  set(subkey, object={}) {
    this.#currentSaveObject[subkey] = object;

    SaveState.#save(this.#currentKey, this.#currentSaveObject);
  }

  // helpers

  #setCurrentKey(key) {
    this.#currentKey = key;
    SaveState.#setActiveKey(key);
  }

  // save backend, decoupled from the public API, so it can be changed without breaking
  // stuff.

  // currently configued for the localStorage web API.

  static #prefix = "gameSaves//";

  static #fullyQualified(key) {
    return SaveState.#prefix + key;
  }

  static #getActiveKey() {
    return localStorage.getItem(SaveState.#prefix) ?? "default";
  }

  static #setActiveKey(key) {
    localStorage.setItem(SaveState.#prefix, key);
  }

  static #load(key) {
    return JSON.parse(
      localStorage.getItem(SaveState.#fullyQualified(key)));
  }

  static #save(key, object) {
    localStorage.setItem(SaveState.#fullyQualified(key), JSON.stringify(object));
  }

  static {
    window.saveState = new SaveState();
  }
}
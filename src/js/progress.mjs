"use strict";

// For unlocking later rooms

const SAVE_KEY = "progress";

export default class Progression {

  static {
    window.progress = new Progression();
  }
};
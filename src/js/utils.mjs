"use strict";

export class DOMUtil {
  static {
    window.DOMUtil = DOMUtil;
  }

  static doNothingEventListener(e) {
    e.preventDefault();
  }

  // checks a boolean string attribute on a html element, with my own nice semantics
  static checkBoolAttr(string, defaultValue, nullValue=null) {
    if (string        === "true")   {
      return true;                                    // data-enable-this-thing="true"
    } else if (string === "false")  {
      return false;                                   // data-enable-this-thing="false"
    } else if (string === "" && nullValue !== null) {
      return nullValue;                               // data-enable-this-thing (means true here)
    } else if (string == null)      {
      return defaultValue;                            // not present
    }

    throw new Error("Attribute is boolean, must be 'true' or 'false'");
  }

  static setAbsolutePosition(element, left, top=left, right='unset', bottom='unset') {
    element.style.top = top;
    element.style.left = left;
    element.style.right = right;
    element.style.bottom = bottom;
  }
}

export class MathUtil {
  static {
    window.MathUtil = MathUtil;
  }

  static lerp(start, end, amount) {
    return start * (1.0 - amount) + end * amount;
  }

  static clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  // sigmoid
}

export class ArrayUtil {
  static {
    window.ArrayUtil = ArrayUtil;
  }

  // checks if an array has duplicate elements
  static hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
  }

  // equality
  static equal(a, b) {
    return areSetsEqual(new Set(a), new Set(b));
  }
}

export function areSetsEqual (a, b) {
  return a.size === b.size && [...a].every(value => b.has(value));
}

// ------------------------------------------------------------------------------------------------------

export class EventSystem {
  static #Event = class Event {
    constructor(name) {
      this.name = name;
      this.callbacks = [];
    }

    registerCallback(callback){
      this.callbacks.push(callback);
    }
  }

  #events = {};

  registerEvent(eventName) {
    let event = new EventSystem.#Event(eventName);
    this.#events[eventName] = event;
  }

  dispatchEvent(eventName, eventArgs) {
    this.#events[eventName].callbacks.forEach(callback => callback(eventArgs));
  };

  // clearEvent ?

  addEventListener(eventName, callback) {
    if (!this.#events[eventName]) {
      throw new Error("Invalid event");
    }
    this.#events[eventName].registerCallback(callback);
  };
}

export function NOT(bit) {
  return bit === 0 ? 1 : 0; // If 1 then 0 else 1
}

// ------------------------------------------------------------------------------------------------------

// Global exports, exist even without direct inclusion of this script in the HTML
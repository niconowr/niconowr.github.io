"use strict";

/* <script src="../../js/action-log.mjs" type="module" async></script> */

/**
 * Records messages in the order they are posted, like console.log
 *
 * HOW TO USE:
 *
 * 1. Include on page.
 *
 * 2. window.actionLog.push("I did this thing just now")
 *
 * 3. The script will create a new <p> element and insert it under the div with the
 * .action-log class.
 *
 * You can access all previous messages, starting from the most recent one, with
 * window.actionLog.history
 *
 * Log history will be automatically saved and reloaded if the saveState.js script
 * was included before this one.
 */

const SAVE_KEY = "actions";

function save(actions) {
  window.saveState?.set(SAVE_KEY, actions);
}

function load() {
  // list of completed quests
  return window.saveState?.get(SAVE_KEY) ?? [];
}

export default class ActionLog {
  // message object
  static #Message = class Message {
    #message;
    #element;
    #countdown;

    get message() {
      return this.#message;
    }

    constructor(message, parentElement, timeOut) {
      this.#message = message;
      this.#element = this.#createBubble(parentElement);

      if (timeOut) {
        this.#countdown = setTimeout(() => {
          this.destroy();
        }, timeOut * 1000);
      }
    }

    destroy() {
      clearTimeout(this.#countdown);
      this.#element.remove();
    }

    #createBubble(parentElement) {
      // create element and parent it
      const bubble = document.createElement('p');

      bubble.textContent = this.#message;

      parentElement.prepend(bubble);
      return bubble;
    }
  }

  // state
  #current = [];

  #config = {
    containerElement: document.querySelector(".action-log"),
    timeOut: 3,
    messageLimit: 3
  }

  get history() {
    return this.#current.map(m => m.message);
  }

  constructor(state=[], config={}) {
    this.#config = { ...this.#config, ...config };

    // sometimes reverse order?
    state.forEach(m => this.#push(m));
  }

  push(message) {
    this.#push(message);

    save(this.history);
  }

  clearAll() {
    this.#current.forEach(e => e.destroy());
    this.#current = [];

    save(this.history);
  }

  #push(message) {
    // create element
    this.#current.unshift(this.#createMessage(message));

    // fall off the end of the queue
    this.#current = this.#trimQueue(this.#current);

    //scroll to top of log
    this.#config.containerElement.scrollTo({ top: 0, behavior: "smooth" });
  }

  #createMessage(message) {
    return new ActionLog.#Message(
      message,
      this.#config.containerElement,
      this.#config.timeOut);
  }

  #trimQueue(messages) {
    // fall off the end of the queue
    if (this.#config.messageLimit) {
      if (messages.length > this.#config.messageLimit) {
        messages[this.#config.messageLimit].destroy();
        messages.splice(this.#config.messageLimit, 1);
      }
    }

    return messages;
  }

  static {
    window.actionLog = new ActionLog(
      load(),
      {
        timeOut: false,     // disable
        messageLimit: false // disable
      }
    );
  }
}
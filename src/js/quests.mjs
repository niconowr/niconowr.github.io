
"use strict";

import { EventSystem } from "./utils.mjs";

/**
 * HOW TO USE:
 *
 * 0. Include this file somewhere in your HTML
 *
 * 1. Define a quest by setting the data-quest attribute to a unique id, on some text element, like a <p>
 *
 * 2. Use your own JavaScript logic to detect when that quest has been completed
 *
 * 3. Call window.quests.complete(id) where the id is the one you set on the text element
 *
 * The script will automatically cross out the corresponding quest text, it will also
 * save the progress if the saveState.js script was loaded prior to this one.
 *
 * OPTIONAL:
 *
 * A data-quest attribute can also be followed by a data-on-complete attribute, here you can
 * put some JavaScript that will run when the user completes the quest, it will also run again
 * if the page is reloading and it was completed in the past (requires saveState.js to be loaded)
 *
 * EXAMPLE:
 *
 * <!-- It's intended you put the attributes on the actual quest titles themselves -->
 * <h3 data-quest="throwAway">Throw it away</h3>
 * <h3
 *    data-quest="pickup"
 *    data-on-complete="console.log('i have all the stuff!')">Pick up everything</h3>
 *
 * <script>
 *    window.quests.addEventListener("complete", () => { console.log("yay!") })
 *
 *    if (window.quests.isComplete("pickup")) {
 *      window.quests.complete("pickup");
 *    }
 * </script>
 */

const SAVE_KEY = "quests";

function save(quests) {
  window.saveState?.set(SAVE_KEY, quests);
}

function load() {
  // list of completed quests
  return window.saveState?.get(SAVE_KEY) ?? [];
}

class QuestSystem {

  get elements() {
    return document.querySelectorAll("[data-quest]");
  }

  get list() {
    return [ ...this.elements ].map(e => e.dataset.quest);
  }

  get completed() {
    return [ ...this.elements ].filter(q => q.dataset.complete).map(q => q.dataset.quest);
  }

  addEventListener(name, callback) {
    this.#eventSystem.addEventListener(name, callback);
  }

  complete(id) {
    if (!this.list.includes(id)) {
      throw new Error("Undeclared quest");
    }

    const quest = this.#questById(id);

    if (quest.dataset.complete) {
      return;
    }

    new Function(quest.dataset.onComplete)
      .call(this);

    quest.dataset.complete = true;
    this.#eventSystem.dispatchEvent("complete");
    this.#disableQuestElement(quest);

    save(this.completed);
  }

  isComplete(id) {
    return this.completed.includes(id);
  }

  #eventSystem = new EventSystem();
  #config = { }
  #disableQuestElement = (element) => {
    element.style.textDecoration = "line-through";
  }

  constructor(state=[], config={}) {
    this.#config = { ...this.#config, ...config }

    this.#eventSystem.registerEvent("complete");

    state.forEach(q => this.complete(q));
  }

  #questById(id) {
    return [ ...this.elements ].find(e => e.dataset.quest == id);
  }

  static {
    // load save here, do it via the constructor
    window.quests = new QuestSystem(load());
  }
}

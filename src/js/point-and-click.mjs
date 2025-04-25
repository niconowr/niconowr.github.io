"use strict";

import { EventSystem, ArrayUtil, DOMUtil, NOT } from "./utils.mjs";

/**
 * A cool script that provides the barebones, basic functionality for a point and click game.
 * It allows you to declaratively construct your game scene and items in HTML, and add higher-level
 * functionality in JavaScript using its API. It manages all related events in a self-contained way,
 * and allows you to add your own events to items in a frictionless manner.
 *
 * The instructions for usage can be found below, beginning from the top of the class definition.
 * There are example code snippets and a full documentation of the scripts functionality, both
 * HTML and JavaScript. All the public functions are at the top, above the rest of the code, as well.
 *
 * The only dependancies are the global `window` object and an ES10 compatible browser. This script uses
 * very modern web APIs. Tested on Firefox and Chrome.
 */

// License: MPL-2.0



export class Inventory { // you will not be able to create NEW instances of this class in your scripts

  // Setup & Scripting
  // ----------------------------------------------------------------------------------------------------

  // This script must be the first <script> tag on the page, and included with the
  // below HTML fragment (this is placed at the end of the <body> tag, after the
  // website):

  /**
  <script src="items.js"></script>
  */

  // After which, you can then load your own scripts and interact with this item manager:

  /**
  <script src="my-room.js"></script>
  <!-- or with an inline script -->
  <script>
    console.log(window.inventory.allItems);

    // the object is always accessed by `window.inventory.*`
    // you can use this function in any script included after this one.

    // you can find all the public JavaScript methods below this whole comment.

    ...
  </script>
  */

  // Creating Items with HTML - Building and placing items in the scene to script with
  // ----------------------------------------------------------------------------------------------------

  // These attributes can be used on ANY HTML element, <img> tags are used because
  // they are the most straightforward examples and immediately demonstrate the functionality as they
  // will display a picture that is the item.

  // You can arrange them in the scene by using `position: absolute;` for the style of them and then
  // using the `top` and `left` CSS rules.

  // ITEM ATTRIBUTES:
  // data-game-item="<item name>"           ; REQUIRED for all items
  // data-use="myFunction(...)"             ; OPTIONAL, code that runs when the player uses
  //                                          the item: (drags it into the scene, clicks it, etc).
  //                                          Intended for hints.
  // data-crafting-consumable="true"        ; OPTIONAL boolean determining if the item is destroyed when
  //                                          used as part of a crafting recipe (think tools like
  //                                          hammers).
  // data-on-pickup="alert('picked up');"   ; OPTIONAL JavaScript string that runs when the item is
  //                                          picked up, also runs when this item is crafted, see below
  //                                          for details.

  // ITEM EXAMPLE:
  /**
  <img data-game-item="golden_key" data-on-pickup="alert('you picked up a key')" src="./key.png">
  */

  // CRAFTING RECIPE ATTRIBUTES: You probably want to hide these elements from display.
  // currently only supports recipes of combining two items, but does support multi-level crafting
  // trees.
  // (regular item attributes are also available here, to define the item itself)
  // data-crafting-recipe="<item name>"     ; REQUIRED, used instead of data-game-item.
  // data-combines="<item 1>, <item 2>, ..."; REQUIRED list of ingredient item names
  // data-disallow-multiple="false"         ; OPTIONAL, set to "true" to only allow the user to craft
  //                                          this item once, despite if they find the necassary
  //                                          ingredients again.

  // CRAFTING EXAMPLE:

  /**
  <!-- ingredients the player can pick up -->
  <img data-game-item="rope" src="./rope.png">
  <img data-game-item="hook" src="./hook.png">

  <!-- this element should be hidden from view from the user via the use of a
  container with 'display:none;' as a CSS rule -->
  <div style='display: none;'>
    <img data-game-item="grapple"
       data-combines="rope, hook" src="./sling.jpg">
  </div>
  */

  // Interaction with objects - Using items from your inventory on things in the scene
  // ----------------------------------------------------------------------------------------------------

  // Here, a "door" refers to something you can "use" a specific item on to execute other functionality,
  // so it doesn't always need to be a door exactly, that's just the language used to describe it here.

  // DOOR ATTRIBUTES: Do NOT set any ITEM attributes on doors
  // data-door="<item name>"                ; REQUIRED key that must be dragged onto the door, an item
  //                                          name
  // data-eats-key="true"                   ; OPTIONAL, determines if the key is destroyed when the door
  //                                          is opened
  // data-on-open="myFunction(...)"         ; OPTIONAL JavaScript string that runs when the door is
  //                                          opened
  // data-open-src="<image path>"           ; OPTIONAL [only works on <img> tags], exactly the same as
  //                                          the src attribute for <img> tags, but will display when
  //                                          the door is opened
  // data-on-click="myFunction(...)"        ; OPTIONAL, Runs when the player clicks on this door,
  //                                          intended for hinting.

  /**
    <!-- notice how the data-door attribute is set to the exact value of a data-game-item attribute -->

    <img data-door="golden_key" data-eats-key="false"
      data-open-src="/opened.jpg" src="./closed.jpg" data-on-open="myFunction('you opened the door!')">
    <!-- You may also make use of the predefined `this` variable as explained earlier in the
      attribute code if you wish -->
  */

  // Player Inventory
  // ----------------------------------------------------------------------------------------------------

  // INVENTORY ATTRIBUTES:
  // data-slot="slot-group-1"               ; REQUIRED, but value can be null (just writing `data-slot`)
  //                                          marks a HTML elemnent as something that an item
  //                                          element can be contained within.
  //                                          If a string is also supplied, it will mark this slot (and
  //                                          others) as being in the same "container", GROUPING them.
  //                                          An empty value will be where items are automatically
  //                                          added to when the player picks them up.
  // data-callback="return myFunction(...)" ; OPTIONAL, A function
  //                                          that returns true or false depending on whether the player
  //                                          is allowed to slot a specific item into this slot, can be
  //                                          used to only allow certain types of items to be moved here.
  //                                          MUST have a `return` statement to work. If unset, slot will
  //                                          allow everything.
  // data-on-slotted="myFunction(...)"      ; OPTIONAL, Runs when
  //                                          an item is successfully put into this slot by the player
  // data-on-click="myFunction(...)"        ; OPTIONAL, Runs when
  //                                          the player clicks on this slot, intended for hinting.

  // HOTBAR EXAMPLE: You can use any structure you like, so long as you label the slot with `data-slot`
  // you probably also should use ids and classes to style this correctly, as they may not be visible
  /**
  <div>
    <div data-slot>
      <!-- Picked-up elements get automatically re-parented inside here, you do not need to do
      anything beyond declaring this in the HTML -->
    </div>
    <div data-slot></div>
    <div data-slot></div>
    <div data-slot></div>
  </div>
  */

  // JavaScript API: Accessed in ANY script tag or file via window.inventory.*
  // ----------------------------------------------------------------------------------------------------

  // EVENT ATTRIBUTES:
  // Attributes that allow you to write JavaScript have access to two predefined variables:
  // this           ; A reference to the HTML element, the exact one you are writing the attribute for
  //                  (always set)
  // withObject    ; Where relevant, a reference to an element that initiated the event. i.e. the
  //                  element being inserted into a slot for the `data-on-slotted` attribute event.
  //                  (sometimes null if there isn't a relevant initating object, like an on-click event)

  // EVENT ATTRIBUTE EXAMPLE:
  /**
  <!-- The meaning and usage of these attributes can be found below -->
  <div class="slot switchboardSlot"
    data-slot="scene"
    data-callback="return itemIsSwitch(this, withObject)"
    data-on-click="clickedSwitchSlot(this)"
    data-on-slotted="switchConnected(this, withObject)">
  </div>

  <script>
    function itemIsSwitch(slot, item) {
      // return whether it's allowed in this slot
      if (!item.dataset.gameItem.includes("switch-")) {
        console.log("I can only put switches on the switch board")
        return false;
      }
      return true;
    }
    function clickedSwitchSlot() {
      console.log('its missing a switch')
    }
    function switchConnected(slot, item) {
      console.log('i put', item, 'in the slot', slot)
    }
  </script>
  */

  // Public inventory Functions
  // ----------------------------------------------------------------------------------------------------

  // the below three functions return an object in the below format, they are getter functions, so
  // you omit the parenthesis `()` at the end. You cannot edit the value.
  // {
  //   name: "golden key",
  //   element: <a reference to the HTML element>
  //   <more useful info depending on OPTIONAL attributes>
  // }

  // const allItems = inventory.allItems

  // returns all items on the page
  get allItems() {
    return this.#getAllItemElements().map((e)       => (this.getItemElementData(e)));
  }

  // returns all the items you can craft
  get craftingRecipes() {
    return this.#getAllCraftableElements().map((e)  => (this.getItemElementData(e)));
  }

  // returns a list of the items the player is currently holding
  get heldItems() {
    return this.#getHeldElements().map((e)          => (this.getItemElementData(e)));
  }

  // returns a map of all the containers on the page, mapping their names to the list of slots
  // within them
  get slots() {
    return { ...this.#slotGroups };
  }

  // returns a list of the player hotbar slots
  get hotbarSlots() {
    return [ ...this.#slotGroups[this.#config.playerInventoryKey] ];
  }

  get root() {
    return this.#config.root;
  }

  get hotbarSlotGroupName() {
    return this.#config.playerInventoryKey;
  }

  // returns loads of information about an item HTML element
  getItemElementData(itemElement) {
    return {
      name: itemElement.dataset.gameItem ?? itemElement.dataset.craftingRecipe,
      element: itemElement,

      // null if not craftable
      recipe: (Inventory.isValidCraftingRecipe(itemElement)) ?
        this.#getIngredientElements(itemElement).map(ingredient => ingredient.dataset.gameItem) : null,

      usedInCraftingRecipes: this.#getAllCraftableElements()
        .filter(recipe => this.#getIngredientElements(recipe)
          .map(ingredient => ingredient.dataset.gameItem)
          .includes(itemElement.dataset.gameItem))
        .map(recipe => this.getItemElementData(recipe)),

      interactsWith: this.#doorElements.filter(e => e.dataset.door == itemElement.dataset.gameItem),

      // null if not in player inventory or scene slots (basically not been picked up)
      currentSlot: (this.#isHoldingElement(itemElement)) ?
        this.getInventoryMap().find(m => m.item == itemElement).slot : null,
    };
  }

  // Other Information Getters
  // ----------------------------------------------------------------------------------------------------

  // returns true if the player is holding this item, false if not
  // can be a name or a HTML element
  isHoldingItem(item) { // "golden_key"
    return this.heldItems.some((i) => i.name === item || i.element == item);
  }

  // returns a list of:
  // {
  //    slot: <HTML element>,
  //    item: <HTML element contained in the slot>
  // }
  // the list will only contain entries where the slot actually has something in it
  getInventoryMap(group=null) { //optional parameter
    if (group && !this.#slotGroups[group]) {
      throw new Error("No such slot group: " + group);
    }

    // get the item inside a slot, it MUST be a direct child
    const getChild = (s) => {
      const children = s.querySelectorAll(`:scope > [${Inventory.#ITEM_DATA_ATTR}]`);

      if (children.length > 1 && this.#config.debug) {
        throw new Error("Cannot parent multiple items to one slot");
      }

      return children[0];
    }

    return (group ? this.#slotGroups[group] : this.#slots).map((s) => ({
        slot: s,
        item: getChild(s)
      })).filter(x => x.item);
  }

  // returns the HTML element of an item with the given name, including crafting recipes by default
  // getItemElementByName(name, excludeCraftingRecipes=false) { //optional parameter
  //   if (excludeCraftingRecipes) {
  //     return this.#config.root.querySelector(
  //       `[data-game-item='${name}']:not(${ItemManager.#CRAFT_DATA_SELECTOR})`);
  //   }
  //   return this.#config.root.querySelector(`[data-game-item='${name}']`);
  // }

  // Inventory Actions - Alter the player's inventory
  // ----------------------------------------------------------------------------------------------------

  // removes all logic related to this script from the slot, turning it into a regular element again.
  // the player cannot interact with it in any way afterwards.
  // will also disable any item that it currently contains, if any, to avoid bugs.
  disableSlot(element) {
    if (!element) {
      return;
    }

    const item = this.#getSlotContents(element);

    if (item) {
      Inventory.#disableItem(item);
    }

    Inventory.#disableSlot(element);
    this.reconfigure(false);
  }

  // removes all logic related to this script from the item, turning it into a regular element again.
  // the player cannot interact with it in any way afterwards.
  // will also disable the slot that currently contains it, if any, to avoid bugs.
  disableItem(element) {
    if (!element) {
      return;
    }

    const slot = this.getItemElementData(element).currentSlot;

    if (slot) {
      Inventory.#disableSlot(slot);
    }

    Inventory.#disableItem(element);
    this.reconfigure(false);
  }

  // removes all logic related to this script from the door, turning it into a regular element again.
  // the player cannot interact with it in any way afterwards. key items will continue to function
  // as items.
  disableDoor(element) {
    if (!element) {
      return;
    }

    if (element.dataset.onClick) {
      element.style.cursor = 'unset';
    }

    element.removeAttribute("data-door");
    this.reconfigure(false);
  }

  // removes an item from the player's inventory and reparents it to a selector for another element
  takeHeldItem(element, containerSelector) {
    // has to be inside the #root
    this.#config.root.querySelector(containerSelector).appendChild(
      this.heldItems.find((i) => i.element == element)?.element);
  }

  // adds a valid item element to the player's inventory, returns true if successful, false if not
  addItemElementToInventory(element) {
    if (!Inventory.isValidItem(element)) {

      if (this.#config.debug) {
        throw new Error(
          `${element} is not a valid game item, it must have at least the 'data-game-item' attribute`);
      }

      return false;
    }

    // untested
    if (this.#isHoldingElement(element, this.#config.playerInventoryKey)) {
      if (this.#config.debug) {
        console.warn(element, "is already in the player's inventory");
      }

      return false;
    }

    // gets moved inside #config.root if not there already
    if (!this.#moveToInventory(element)) {
      if (this.#config.debug) {
        console.warn("Player's inventory is full");
      }

      return false;
    }

    // item needs to be bootstrapped
    this.reconfigure(false);

    return true;
  }

  // Optional function to for complex crafting recipes, item selection logic and UI/UX is up to the
  // caller.

  // the ingredients param is a list that can have any number of ingredients (that you are supplying
  // for the given recipe)
  // for simple recipes with only two ingredients, you do NOT need to call this function.

  // product can either be an item name or a crafting recipe HTML element
  // slot can be null to just put the item anywhere the user has space in their inventory

  // returns true or false depending on if the operation was successful
  craftItem(product, ingredients, slot=null) {
    if (typeof product == "string") {
      product = document.querySelector(`[data-crafting-recipe='${product}']`);
    }

    // validity
    if (!product || !Inventory.isValidCraftingRecipe(product)) {
      throw new Error(
        `${product} is not a valid crafting recipe, it may have data-disallow-multiple set to "true"`);
    }
    if (ingredients.filter(i => !Inventory.isValidItem(i)).length != 0) {
      throw new Error(`${i} is not a valid item to craft with`);
    }

    if (slot) {
      // is it a valid slot?
      if (!this.#isLoadedSlot(slot)) {
        throw new Error(`${slot} is not a valid inventory slot`);
      }

      // is it empty?
      const item = this.#getSlotContents(slot);
      if (item) {

        if (!ingredients.includes(item)) {
          if (this.#config.debug) {
            console.warn("Cannot craft item, slot is occupied");
          }

          return false;
        }
      }
    }

    // check recipe is actually fulfilled
    {
      const required = this.#getIngredientElements(product).map(p => p.dataset.gameItem);
      const supplied = ingredients.map(p => p.dataset.gameItem);

      if (required.filter(x => !supplied.includes(x)).length != 0) {
        return false;
      }

      // only mutate the ingredients the recipe actually uses, filter out the rest
      ingredients = ingredients.filter(i => required.includes(i.dataset.gameItem));
    }

    // crafting begins now

    ingredients.forEach(i => {
      if (DOMUtil.checkBoolAttr(i.dataset.craftingConsumable, true, true)) {
        i.remove();
      } else {
        i.setAttribute("data-used-to-craft", true);
      }
    });

    let node;
    if (!DOMUtil.checkBoolAttr(product.dataset.disallowMultiple, false, true)) { // clone node
      node = product.cloneNode(true);

      if (this.#config.debug) {
        console.debug("Cloned item:", node);
      }

    } else {
      node = product;
    }

    // make it a normal item instead of a crafting schematic
    Inventory.#convertRecipeToItem(node);

    if (!this.#moveToInventory(node, slot)) {
      // slot is occupied, possibly by a non-consumable item
      // console.log("swapped")
      if (!this.#moveToInventory(node)) {
        throw new Error("Internal crafting error");
      }
    }

    this.reconfigure(false);

    if (this.#config.debug) {
      console.info("Crafted item:", node);
    }

    return true;
  }

  // same as above but for new inventory slots (if you expand the player's carrying capacity)
  registerNewSlotElement(element) {
    if (Inventory.isValidSlot(element)) {
      this.#setupInventory();

    } else {
      throw new Error("Invalid slot element");
    }
  }

  // works exactly like addEventListener for DOM elements, but for custom events listed below
  // Supported Events:
  // "pickupItem" =>  callback will be supplied with an object, event.item is the item that
  //                  was picked up
  // "useItem" ```=> `callback will be supplied with an object, event.item is the item that
  //                  was used, and event.withObject is the object it was used on
  // EXAMPLE:
  // window.inventory.addEventListener("pickupItem", (e) => console.log(e.item));
  addEventListener(name, callback) {
    this.#eventSystem.addEventListener(name, callback);
  }

  // Other Config
  // ----------------------------------------------------------------------------------------------------

  // resets the internal state of the object, will cause it to update to all changes to items and
  // inventory slots on the page, normally does not need to be manually called
  // alter settings for your page, capital value means the default value for booleans
  // root: document.body          ; the root element where all the game elements are parented under
  // debug: (TRUE / false)        ; prints debug messages about inventory and scene interactions to the
  //                                console
  // noEval: (true / FALSE)       ; just a thing incase we add a Content Security Policy (CSP), uneeded
  //                                currently
  // fullInventoryCallback:       ; a function that runs if the user tries to pick up an object whilst
  //                                their inventory is full, by default it shows a dialogue in the
  //                                browser
  reconfigure(config=false) {
    if (this.#config.debug) {
      console.debug("Reconfiguring inventory system");
    }

    // below are the default settings, so you only need to change what you need to
    if (config !== false) {
      this.#applyConfig(config);
    }

    this.#clearEventListeners();

    this.#setupInventory();
    this.#setupItems();
    this.#setupScene();

    console.info("Reinitialized page state");
    if (this.#config.debug) {
      console.debug("Inventory slots: ",                  this.#slotGroups);
      console.debug("Items detected on page: ",           this.#itemElements);
      console.debug("Craftable items detected on page: ", this.#craftingElements);
      console.debug("Door elements detected:",            this.#doorElements);
    }
  }

  enablePageChangeDetection() {
    this.reconfigure(false);

    // update when the DOM changes
    function mutationListener() {
      Inventory.#OBSERVER.observe(this.#config.root, { childList: true, subtree: true });
    }
    window.addEventListener("DOMContentLoaded", mutationListener);
  }

  // Getters and Setters, used like: `window.inventory.root.querySelector(...)` etc, (no parenthesis)
  // ----------------------------------------------------------------------------------------------------



  // Internal code, everything below cannot be accessed from instances, because its
  // name is preceded with # (this script cannot be instanced outside of this file either)
  // ----------------------------------------------------------------------------------------------------

  // OLD PUBLIC API
  // data-desc="..."                        ; OPTIONAL description, for you to make use of as you wish.

  // private variables and private static functions

  static #entityInits = 0;

  static #assignEntityNumber(element, name, existing) {
    // set up automatic unique slot numbering
    const number = element.getAttribute(name);
    if (!number || number == '' || parseInt(number) == NaN) {
      let index;
      while (true) {
        index = this.#entityInits++;
        if (!existing.includes(index)) {
          break;
        }
      }

      element.setAttribute(name, index);
    }
  }

  // constants

  static #ITEM_DATA_ATTR          = "data-game-item";
  static #CRAFT_DATA_SELECTOR     = "[data-crafting-recipe][data-combines]";
  static #DOOR_ELEMENT_SELECTOR   = "[data-door]";

  static #OBSERVER = new MutationObserver((mutationList, observer) => {
    // maybe check the mutation list to see if it's needed?
    window.inventory.reconfigure(false);
  });

  // instance variables

  // returns a flat list of all slots on the page
  get #slots() {
    return Object.values(this.#slotGroups).flat(1);
  }

  // default config values
  #config = {
    root:                   document.getElementById("playArea") ?? document.body,
    debug:                  false,
    noEval:                 false,
    allowRearrange:         true,
    playerInventoryKey:     "",
    fullInventoryCallback:  () => {}
  }

  #eventListeners   = [];

  #eventSystem = new EventSystem();

  #itemElements     = [];
  #craftingElements = [];
  #doorElements     = [];
  #slotGroups = {
    // a map of slot group name to a list of the slots
  };

  // should only be instanced once per page
  constructor(config={}) {
    this.#eventSystem.registerEvent("pickupItem");
    this.#eventSystem.registerEvent("useItem");

    this.#applyConfig(config);
    this.reconfigure(false);
  }

  // private methods

  #applyConfig(config={}) {
    this.#config = {...this.#config, ...config};
  }

  // event management
  // ----------------------------------------------------------------------------------------------------

  // ensures no duplicate event handlers
  #addEventListener(element, event, listener, options=false) {
    if (this.#eventListeners.find(e =>
      e.element   == element   &&
      e.event     == event     &&
      e.listener  == listener  &&
      e.options   == options)) {

      // event already exists
      // console.debug("event already exists:", element, event, options);
      return;
    }

    // all this info needs to be recorded so the event can be identified by removeEventListener()
    this.#eventListeners.push({
      element:  element,

      event:    event,
      listener: listener,
      options:  options
    });

    element.addEventListener(event, listener, options);
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#matching_event_listeners_for_removal
  // only clears event listeners set by this script
  #clearEventListeners() {
    this.#eventListeners.forEach(e => {
      e.element.removeEventListener(e.event, e.listener, e.options);
    });

    this.#eventListeners = [];
  }

  // main top-level functions that do everything
  // ----------------------------------------------------------------------------------------------------

  #setupScene() {
    // dependant upon items being configured
    this.#doorElements = [...this.#config.root.querySelectorAll(`${Inventory.#DOOR_ELEMENT_SELECTOR}`)];
    this.#doorElements.forEach((e) => this.#setupDoor(e));
  }

  #setupItems() {
    this.#craftingElements = this.#config.root.querySelectorAll(
      `${Inventory.#CRAFT_DATA_SELECTOR}:not(${Inventory.#ITEM_DATA_ATTR})`);

    this.#itemElements = [...this.#config.root.querySelectorAll(
      `[${Inventory.#ITEM_DATA_ATTR}]:not(${Inventory.#CRAFT_DATA_SELECTOR})`)];

    const itemNumbers = this.#itemElements.map(s => s.dataset.itemNumber).filter(x => x);

    // Error checking
    if (ArrayUtil.hasDuplicates([...this.#craftingElements].map(e => e.dataset.craftingRecipe))) {
      throw new Error("Cannot have duplicate crafting recipes");
    }
    if (ArrayUtil.hasDuplicates(itemNumbers)) {
      throw new Error("Duplicate data-item-number atttributes");
    }
    if (itemNumbers.find(s => s < 0)) {
      throw new Error("Cannot have a negative value for data-item-number");
    }

    this.#itemElements.forEach((e)      => this.#setupItem(e, itemNumbers));
    this.#craftingElements.forEach((e)  => this.#setupDualCraftingRecipe(e));
  }

  #setupInventory() {
    // existed validly before the refresh
    const allSlots = this.#config.root.querySelectorAll("[data-slot]");
    const OldGenerationSlotNumbers = [...this.#slots].map(s => s.dataset.slotNumber).filter(x => x);

    this.#slotGroups = {}; // clears the this.slots getter !!! Must be last

    // slot numbers need to be valid for short periods of time inbetween events firing,
    // all other times, they can change, so long as they remain valid / reconfigure() is called.
    if (ArrayUtil.hasDuplicates(OldGenerationSlotNumbers)) {
      throw new Error("Duplicate data-slot-number atttributes");
    }
    if (OldGenerationSlotNumbers.find(s => s < 0)) {
      throw new Error("Cannot have a negative value for data-slot-number");
    }

    // populate the slot id -> item hash map, create the key if it does not exist
    for (let s of allSlots) {
      this.#slotGroups[s.dataset.slot] =
        this.#slotGroups[s.dataset.slot] ? [...this.#slotGroups[s.dataset.slot], s] : [s];
    }
    // console.log(this.#slotGroups)

    allSlots.forEach((e) => this.#setupSlot(e, OldGenerationSlotNumbers, e.dataset.slot));
  }

  // ----------------------------------------------------------------------------------------------------

  #setupSlot(element, slotNumbers) {
    Inventory.#assignEntityNumber(element, "data-slot-number", slotNumbers);

    if (element.dataset.onClick) {
      this.#addEventListener(element, "click", () => {
        this.#evalAttribute(element, element.dataset.onClick);
      });

      element.style.cursor = 'pointer';
    }

    // reordering stuff in your hotbar
    if (!this.#config.allowRearrange) {
      return;
    }

    this.#addEventListener(element, "dragover", DOMUtil.doNothingEventListener);

    // if unset, allow everything
    const isItemAllowedInSlot = (item, slot) => {
      if (slot.dataset.callback && !this.#evalAttribute(slot, slot.dataset.callback, item)) {

        if (this.#config.debug) {
          console.debug("Item disallowed in this slot");
        }
        return false;
      }

      return true;
    }
    // this NEEDS to run after all this scripts own logic
    const executeSceneSlot = (item, slot) => {
      this.#evalAttribute(slot, slot.dataset.onSlotted, item);
    }

    this.#addEventListener(element, "drop", (e) => {
      e.preventDefault();

      // ensure it is both a valid item and within the inventory
      const parser = new DOMParser();
      const dragElement = parser.parseFromString(e.dataTransfer.getData("text/html"), 'text/html')
        .querySelector(`[${Inventory.#ITEM_DATA_ATTR}]`);

      // can sometimes be null if it is empty
      const thisSlot = this.getInventoryMap().find(e => e.slot == element);
      // fails if gameItem is not unique, we need an autoset itemID
      const dragElementInstance = this.#config.root.querySelector(
        `[data-item-number='${dragElement.dataset.itemNumber}']`);

      // if this slot is a scene slot, run the test function
      if (!isItemAllowedInSlot(dragElementInstance, element)) {
        return;
      }

      // stop if it is a crafting element
      if (this.getItemElementData(dragElementInstance).usedInCraftingRecipes
          .find(r => r.recipe.includes(element))) {
        return;
      }

      // slot is populated already and it's not by the current element we dropped (moving it nowhere)
      if (thisSlot && thisSlot.item !== dragElementInstance) {
        const otherSlot = this.#getSlotByNumber(dragElement.dataset.previousSlot);

        if (!isItemAllowedInSlot(thisSlot.item, otherSlot)) {
          return;
        }

        // this slot is already populated, so move its item to the dragElement's previous slot
        // attribute
        otherSlot?.appendChild(thisSlot.item);

        this.#useItem(dragElementInstance, thisSlot.item);

        executeSceneSlot(thisSlot.item, otherSlot);
      }

      element.appendChild(dragElementInstance);

      executeSceneSlot(dragElementInstance, element);
    });
  }

  // ----------------------------------------------------------------------------------------------------

  #setupItem(element, itemNumbers) {
    Inventory.#assignEntityNumber(element, "data-item-number", itemNumbers);

    if (!this.#isHoldingElement(element)) {
      element.setAttribute("draggable", false);
    }

    this.#addEventListener(element, "click", () => {
      if (!this.#isHoldingElement(element)) {

        if (this.#config.debug) {
          console.info("Picked up: ", element.dataset.gameItem);
        }
        // should always be true
        console.assert(this.#moveToInventory(element));

        // how it's been positioned in the scene, not needed anymore
        DOMUtil.setAbsolutePosition(element, 'unset');

        this.#eventSystem.dispatchEvent("pickupItem", { item: element });

      } else {
        this.#useItem(element);
      }
    });

    this.#addEventListener(element, "dragstart", (e) => {
      if (!this.#isHoldingElement(element)) {
        return;
      }

      element.setAttribute("data-previous-slot",
        this.getItemElementData(element).currentSlot.dataset.slotNumber);

      // this overwrites the door logic's data -> fixed i think
      e.dataTransfer.setData("text/html", element.outerHTML);
    });

    this.#addEventListener(element, "dragend", (e) => {
      if (!this.#isHoldingElement(element)) {
        return;
      }

      // if current slot is different from previous, do not run use
      if (element.dataset.previousSlot ===
        this.getItemElementData(element).currentSlot.dataset.slotNumber) {

        // find out if the dropped it over a door
        // could be buggy depending on window offset
        const elementsBelowMouse = document.elementsFromPoint(e.clientX, e.clientY);
        const doorElement = elementsBelowMouse.find(d => Inventory.isValidDoor(d));

        // this should not fire if it is being dropped as a result of a successful usage in a crafting
        // recipe (item would've been non-consumable)
        if (!DOMUtil.checkBoolAttr(element.getAttribute("data-used-to-craft"), false, true)) {
          this.#useItem(element, doorElement);

        } else {
          // remove it to reset the state of the tool for future drag events
          element.removeAttribute("data-used-to-craft");
        }
      }

      element.removeAttribute("data-previous-slot");
    });

    // element.addEventListener("drag", (e) => {
    //   e.target.style.opacity = 1;
    // });
  }

  // ----------------------------------------------------------------------------------------------------

  // sets up drag and drop event listeners on items that are part of a crafting recipe
  #setupDualCraftingRecipe(product) {
    if (!Inventory.isValidCraftingRecipe(product)) {
      throw new Error("Crafting recipe must have a data-crafting-recipe attribute");
    }

    const ingredientElements = this.#getIngredientElements(product); // [item1, item2, ...]

    if (ingredientElements.includes(null)) {
      // it just wont be craftable until the page is mutated with the ingredients added
      if (this.#config.debug) {
        throw new Error("Crafting ingredient item does not exist on page");
      }
    }

    if (ingredientElements.length != 2) {
      if (this.#config.debug) {
        console.warn(
          "This recipe cannot have drag-and-drop craft because it has more than two ingredients");
      }
      return;
    }

    // this should be separated out into a generic setupCrafting recipe function, damn these should
    // really just be objects now
    product.setAttribute("draggable", false);

    // alternating drag drop events for both items
    ingredientElements.forEach((_, index) => {

      this.#addEventListener(ingredientElements[index],       "dragstart", (e) => {
        e.dataTransfer.setData("text/plain", ingredientElements[index].dataset.gameItem);
      });

      this.#addEventListener(ingredientElements[NOT(index)],  "dragover",   DOMUtil.doNothingEventListener);

      this.#addEventListener(ingredientElements[NOT(index)],  "drop",       (e) => {
        e.preventDefault();

        // ingredient2 is the right ingredient of the product, so check if the item is the left one
        if (e.dataTransfer.getData("text/plain") == ingredientElements[index].dataset.gameItem) {
          e.stopPropagation(); // do not fire hotbar swap events

          // do crafting
          this.craftItem(product,
            ingredientElements,
            this.getInventoryMap(this.#config.playerInventoryKey)
              .find(s => s.item == ingredientElements[NOT(index)]).slot);
        }
      }); // capture = true ?
    })
  }

  // ----------------------------------------------------------------------------------------------------

  // sets up drag and drop logic for dragging items out of the
  // inventory into the environment (to open stuff like doors)
  #setupDoor(doorElement) {
    // Door config

    if (doorElement.dataset.onClick) {
      this.#addEventListener(doorElement, "click", () => {
        this.#evalAttribute(doorElement, doorElement.dataset.onClick);
      });

      doorElement.style.cursor = 'pointer';
    }

    doorElement.setAttribute("draggable",   false);
    doorElement.setAttribute("data-opened", false);

    // required by the html drag and drop api
    this.#addEventListener(doorElement, "dragover", DOMUtil.doNothingEventListener);

    // Key config

    /// dont give the event listener to recipes ->
    // it will be given when the system refreshes after crafting
    const keyElements = this.#config.root.querySelectorAll(
      `[data-game-item="${doorElement.dataset.door}"]:not(${Inventory.#CRAFT_DATA_SELECTOR})`);

    keyElements.forEach(k => {
      // key is only draggable to the door after it is picked up (inventory)
      // const dragStartListener =
      this.#addEventListener(k, "dragstart", (e) => {
        e.dataTransfer.setData("text/plain", k.dataset.gameItem);
      });

      this.#addEventListener(doorElement, "drop", (e) => {
        e.preventDefault();

        // need to check it is the current thing being dragged by the user
        if (e.dataTransfer.getData("text/plain") == doorElement.dataset.door) {
          if (DOMUtil.checkBoolAttr(doorElement.dataset.opened, false, true)) {

            if (this.#config.debug) {
              console.info("Door already opened");
            }
            return;
          }

          if (DOMUtil.checkBoolAttr(doorElement.dataset.eatsKey, true, true)) {
            k.remove(); // Delete the key item used to open the door
          }

          doorElement.setAttribute("src", doorElement.dataset.openSrc);
          doorElement.setAttribute("data-opened", true);

          this.#evalAttribute(doorElement, doorElement.dataset.onOpen);
          this.disableDoor(doorElement);
        }
      });
    })
  }

  // Misc
  // ----------------------------------------------------------------------------------------------------

  #moveToInventory(itemElement, slot=null) {
    if (!Inventory.isValidItem(itemElement) && this.#config.debug) {
      throw new Error("Invalid item cannot be added to inventory");
    }

    const addItemToSlot = (item, slot) => {
      item.setAttribute("draggable", true);
      slot.appendChild(item);

      this.#evalAttribute(item, item.dataset.onPickup);
    }

    // could be a bit buggy
    if (slot) {
      // slot already occupied
      if (this.#getSlotContents(slot)) {
        return false;

      } else {
        addItemToSlot(itemElement, slot);
        return true;
      }
    }

    for (const slot of this.#slotGroups[this.#config.playerInventoryKey]) {
      if (slot.childElementCount == 0) {
        // empty slot found
        addItemToSlot(itemElement, slot);
        return true;
      }
    }

    // handle inventory full
    this.#config.fullInventoryCallback();

    return false;
  }

  // returns list of HTML elements (items)
  #getIngredientElements(product) {
    return product.dataset.combines
      .split(",")
      .map(i => this.#config.root.querySelector(`[${Inventory.#ITEM_DATA_ATTR}="${i.trim()}"]`));
  }

  #getSlotByNumber(number) {
    return this.#config.root.querySelector(`[data-slot-number='${number}']`);
  }

  #getSlotContents(slot) {
    return this.getInventoryMap().find(e => e.slot == slot)?.item;
  }

  #isLoadedSlot(element) {
    return [...this.#slots].includes(element);
  }

  #evalAttribute(element, string, withObject=null) {
    if (!this.#config.noEval) {
      // console.log(`const element = ${element}; ${string}`)
      // eval(`const element = ${element}; ${string}`);

      // binds the functions "this" variable to the element, allows it to be passed into a function
      return new Function("withObject", string).call(element, withObject);
    }

    return null;
  }

  // the below functions are copies of the above ones, except with HTML element references instead
  // of item names. They exist for your convienience.
  // ----------------------------------------------------------------------------------------------------

  // returns all item HTML elements on the page
  #getAllItemElements() {
    return this.#itemElements;
  }

  // returns all elements you can craft
  #getAllCraftableElements() {
    return [...this.#craftingElements];
  }

  // returns a list of the HTML elements of the items the player is currently holding
  #getHeldElements(group=this.#config.playerInventoryKey) {
    // :scope means only search direct children
    return this.getInventoryMap(group).map(p => p.item);
  }

  // returns true if the player is holding athe given HTML element, false if not
  #isHoldingElement(element, group=null) {
    return [...this.#getHeldElements(group)].some((i) => i == element);
  }

  #useItem(element, on=null) {
    this.#evalAttribute(element, element.dataset.use, on);

    this.#eventSystem.dispatchEvent("useItem", { item: element, withObject: on });
  }

  // should be static

  static #disableSlot(element) {
    if (element.dataset.onClick) {
      element.style.cursor = 'unset';
    }

    element.removeAttribute("data-slot");
  }

  static #disableItem(element) {
    element.removeAttribute("data-game-item");
    element.removeAttribute("data-crafting-recipe");
    element.removeAttribute("data-previous-slot");

    element.setAttribute("draggable", false);
  }

  // turns a recipe element into an item element
  static #convertRecipeToItem(element) {
    element.setAttribute("data-game-item", element.dataset.craftingRecipe);

    element.removeAttribute("data-crafting-recipe");
    element.removeAttribute("data-combines");
  }


  // Static helper methods
  // ----------------------------------------------------------------------------------------------------

  static isValidSlot(element) {
    return element.matches("[data-slot]");
  }

  static isValidItem(element) {
    return element.getAttribute("data-game-item");
  }

  static isValidCraftingRecipe(element) {
    if (element instanceof HTMLElement) {
      return element.matches(`${this.#CRAFT_DATA_SELECTOR}`);

    } else if (typeof element === 'string' || element instanceof String) {
      return this.isValidCraftingRecipe(
        document.querySelector(`[data-crafting-recipe='${element}']`));

    } else {
      return false;
    }
  }

  static isValidDoor(element) { // #DOOR_ELEMENT_SELECTOR
    return element.getAttribute("data-door");
  }

  // optional function, crafting recipes should not be visible to the user
  static initializeDefaultStyle() {
    const css = `
      [data-crafting-recipe] {
        display: none;
      }

      [data-game-item] {
        user-select: none;

        cursor: pointer;
      }

      [data-slot],
      [data-door] {
        user-select: none;

      }
    `;

    // create a style tag and attach it to the document head with the above rules
    const style = document.createElement('style');

    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  static duplicateElements() {
    const duplications = document.querySelectorAll("[data-duplicate-slot][data-slot]");
    duplications.forEach(e => {
      const amount = parseInt(e.dataset.duplicateSlot) - 1;

      if (amount == NaN) {
        throw new Error("Invalid number to duplicate with");
      }

      e.removeAttribute("data-duplicate-slot");

      for (let i = 0; i < amount; i++) {
        e.parentElement.appendChild(e.cloneNode());
      }
    });
  }

  static #createSystem() {
    console.info("Loading inventory script");

    Inventory.initializeDefaultStyle();
    Inventory.duplicateElements();

    window.inventory = new Inventory({
      playerInventoryKey: "",
      // debug: true
    });

    console.info("Inventory script loaded: window.inventory object is ready");
  }

  // This is where the script actually starts running code
  // ------------------------------------------------------------------------------------------------------

  static {
    // Attaches an instance of the class above to the global window object,
    // same object you access document from (shortcut for for window.document).
    if (!window) {
      throw new Error("This script must be ran inside a browser context");
    }

    // do not load more than once, and replace the object if it already exists in a different context
    if (window.inventory) {

      if (window.inventory.constructor?.name === Inventory.name) {
        console.error("Item script included more than once, ignoring...");

      } else {
        console.warn("Hijacking pre-existing window.inventory object!");
        Inventory.#createSystem();
      }

    } else {
      Inventory.#createSystem();
    }
  }
}

// ------------------------------------------------------------------------------------------------------
// Made by Sarah Taseff

// Notes to self
// ------------------------------------------------------------------------------------------------------
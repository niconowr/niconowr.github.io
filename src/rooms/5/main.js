
"use strict";

// wowzzers only 8 global objects from the framework
// and then one from callbacks.

// setting the horizontal scroll position on page load
document.addEventListener('DOMContentLoaded', function() {
  const element = document.getElementById("scene-viewport");
  element.scrollLeft = 350;
});

// window.onload = function() { // it's either this or defer-ing this script
// and any script that uses the global objects
  window.inventory.reconfigure(
    {
      fullInventoryCallback: Room.fullInventory
      // debug: true,
    }
  )

  window.inventory.addEventListener("pickupItem", function() {

    if (window.ArrayUtil.equal(
      window.inventory.root.querySelectorAll("[data-game-item]"),
      window.inventory.root.querySelectorAll(
        `[data-slot='${window.inventory.hotbarSlotGroupName}'] > [data-game-item]`))
    ) {

      if (!window.quests.isComplete("pickup")) {
        window.actionLog.push('i got a lotta stuff');
        window.quests.complete("pickup");
      }
    }
  })

  console.log("Items in the scene:", window.inventory.allItems);
// }

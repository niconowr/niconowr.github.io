"use strict";

/* <script src="../../js/look.mjs" type="module" async></script> */

import { MathUtil } from "./utils.mjs";

/**
 * HOW TO USE:
 *
 * Include this script in your HTML, then whack the `.gimbalLook` class on any element
 * you want camera behaviour for.
 *
 * You can then move the mouse to the edges and have the camera look in that direction.
 * You can also use the NUMPAD arrows or regular arrow keys to pan the camera in all
 * directions.
 *
 * It must be structured like so:
 *
 * <div class="gimbalLook">
 *  <!-- This div must not expand when children overflow, it needs to keep its own size
 *    and scroll them offscreen instead -->
 *
 *  <div id="world">
 *    <!-- This div must be LARGER than the parent div -->
 *  </div>
 * </div>
 */

// config
const panArea = 100;
const acceleration = 4;
const inputDelay = 300;

// state
const scrollDivs = new Set();
let mousePos = {
  x: 0,
  y: 0
}

function pan(element) {
  const rect = element.getBoundingClientRect();
  const relativeMousePos = [mousePos.x - rect.left, mousePos.y - rect.top];

  // leftwards:
  // 0 --- X  panArea
  //    M     range: 0 -> X
  // 1 --- 0  intent
  // amount = clamp(X - M, 0, X) / X
  // intent = lerp(1, 0, amount)

  // rightwards:
  // X --- rect.width
  //    M
  // amount = clamp(M - X, 0, (rect.width - X)) / (rect.width - X)
  // intent = lerp(0, 1, amount)

  // leftAreaStart is 0
  const rightAreaStart = rect.width - panArea;
  let horizontalPan =
    (-1 * MathUtil.lerp(0, 1, MathUtil.clamp(panArea - relativeMousePos[0], 0, panArea) / panArea)) // leftwards
    + (MathUtil.lerp(0, 1, MathUtil.clamp(relativeMousePos[0] - rightAreaStart, 0, panArea) / panArea)); // rightwards
  horizontalPan = horizontalPan * 2;
  horizontalPan = horizontalPan * Math.abs(horizontalPan);

  const bottomAreaStart = rect.height - panArea;
  let verticalPan =
    (-1 * MathUtil.lerp(0, 1, MathUtil.clamp(panArea - relativeMousePos[1], 0, panArea) / panArea)) // leftwards
    + (MathUtil.lerp(0, 1, MathUtil.clamp(relativeMousePos[1] - bottomAreaStart, 0, panArea) / panArea)); // rightwards
  verticalPan = verticalPan * 2;
  verticalPan = verticalPan * Math.abs(verticalPan);

  element.scroll({ left: element.scrollLeft + horizontalPan * acceleration, top: element.scrollTop + verticalPan * acceleration });

  // how much did we move?
  return Math.sqrt((horizontalPan ** 2) + (verticalPan ** 2));
}

document.querySelectorAll(".gimbalLook").forEach(v => {
  v.addEventListener("mouseenter", (e) => {
    // setTimeout(() => {
      scrollDivs.add(v);
    // }, inputDelay);
  });
  v.addEventListener("mouseleave", (e) => {
    scrollDivs.delete(v);
  });
  v.addEventListener("mousemove", (e) => {
    mousePos = { x: e.clientX, y: e.clientY }
  });
});

function main() {
  // scrollDivs.forEach(d => {
  //   if (pan(d) == 0) {
  //     scrollDivs.delete(d);
  //   }
  // });
  scrollDivs.forEach(d => pan(d));

  requestAnimationFrame(main);
}

requestAnimationFrame(main);
# A working room

See the files in the `/js` folder for more information on each of the specific systems.

There is a template version of this room's `index.html` in the `/rooms` directory (above this one).

Play it here on our pages deployment: [2004seraph.github.io/SET08101/rooms/5/](https://2004seraph.github.io/SET08101/rooms/5/)

## Structure

- `assets/`         All the pictures, sounds, stuff specific to this room
- `callbacks.js`    Just where I put all my functions that I use for callbacks in the HTML game attributes, a purely optional separation from main.js. See `index.html` to see where they get used.
- `main.js`         Where I write all the miscillaneous immediate code, like where I add some event listeners to the inventory, change some of its settings, etc.
- `style.css`       Styling specific to this room, like the door, you'll notice I `@import` game.css here (important)
- `index.html`      Where the actual scene, and all the items in it, are defined and layed out.
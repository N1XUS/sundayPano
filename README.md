# sundayPano

Kinda 360 spinner

## How to use

Very simple:

```javascript
$(document).ready(function () {
    "use strict";
    var slides = ['link', 'link', 'link']; // Array of links
    $("#sunday_preview").sundayPano({
        items: slides,
        direction: "horizontal", // Horizontal/vertical. Affects drag direction and control slider position
        control: true, // This one required jQueryUI Slider
        autoplay: false, // True/time in miliseconds
        autoplay_direction: "<", // < or > direction is where arrow is pointing
        speed: 5, // User-drag speed
        before_init: function(opts) {}, // Callback executed before everything
        after_init: function(opts) {}, // Callback executed after all things are ready to do some magic
        set_frame: function(frame_id) {}, // Callback executed right before we set new frame to display
        on_move: function(coord, initial_offset) {} // Callback executed right before we calculate image key (frame_id)
    });
});
```

## ToDo:
* Preloaded image size (1, 5, 10, etc)

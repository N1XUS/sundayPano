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
        control: true, // This one required jQueryUI Slider
        direction: 'vertical' // Horizontal/vertical. Affects drag direction and control slider position
    });
});
```

## ToDo:
* Add events (init, change frame, etc)
* Theming!
* Preloaded image size (1, 5, 10, etc)

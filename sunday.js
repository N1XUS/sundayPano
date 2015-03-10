(function () {
    "use strict";
    $.fn.extend({
        sundayPano: function (opts) {
            var elm, init, move, preload, allow, initial_offset, image_key, preloaded, img_container, slider, set_frame, preload_image, i;
            elm = $(this);
            preloaded = [];
            image_key = 0;
            initial_offset = 0;
            allow = false;

            set_frame = function (frame_id) {
                if (preloaded[frame_id] === undefined && opts.items[frame_id] !== undefined) {
                    preload_image(frame_id, true);
                } else if (preloaded[frame_id] !== undefined) {
                    img_container.css({
                        'background-image': "url('" + preloaded[frame_id] + "')"
                    });
                }
                image_key = frame_id;
                if (opts.control === true) {
                    var add, value;
                    add = (opts.direction === "vertical") ? -1 : 1;
                    value = (frame_id * (100 / opts.items.length)) * add;
                    slider.slider('option', 'value', value);
                }
            };

            preload_image = function (frame_id, set) {
                if (preloaded[frame_id] === undefined && opts.items[frame_id] !== undefined) {
                    var img = $("<img />");
                    if (set === true) {
                        img.attr("src", opts.items[frame_id]).load(function () {
                            $(".images-stack", elm).append(img);
                            preloaded[frame_id] = opts.items[frame_id];
                            img_container.css({
                                'background-image': "url('" + preloaded[frame_id] + "')"
                            });
                        });
                    } else {
                        img.attr("src", opts.items[frame_id]);
                        $(".images-stack", elm).append(img);
                    }
                }
            };

            init = function () {
                // Create hidden div to store preloaded images
                elm.append('<div class="images-stack hidden"></div>');
                // Create container which will change backgrounds (in order to slider worked)
                img_container = $('<div class="pano-images-container"></div>');
                elm.append(img_container);
                if (opts.control === true) {
                    slider = $('<div class="pano-control"></div>');
                    var params = {};
                    params.value = 0;
                    params.min = 0;
                    params.max = 100;
                    params.step = 100 / opts.items.length;
                    params.orientation = (opts.direction === "vertical") ? "vertical" : "horizontal";
                    if (opts.direction === "vertical") { // Since slider goes from bottom to top, we need to reverse values
                        params.min = -100;
                        params.max = 0;
                    }
                    params.slide = function (event, ui) {
                        var add, frame;
                        add = (opts.direction === "vertical") ? -1 : 1;
                        frame = (ui.value / (100 / opts.items.length)) * add;
                        set_frame(frame);
                    };
                    slider.slider(params);
                    elm.append(slider);
                }
                $(img_container).on("mousedown touchstart", function (e) {
                    e.preventDefault();
                    allow = true;
                });
                $(document).on("mouseup touchend", function (e) {
                    e.preventDefault();
                    allow = false;
                });
                $(document).on("mousemove", function (e) {
                    if (allow === true) {
                        e.preventDefault();
                        if (opts.direction === "horizontal") {
                            move(e.pageX - img_container.offset().left);
                        } else {
                            move(e.pageY - img_container.offset().top);
                        }
                    } else {
                        if (opts.direction === "horizontal") {
                            initial_offset = e.pageX - img_container.offset().left;
                        } else {
                            initial_offset = e.pageY - img_container.offset().top;
                        }
                    }
                });

                $(document).on("touchmove", function (e) {
                    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    if (allow === true) {
                        e.preventDefault();
                        if (opts.direction === "horizontal") {
                            move(touch.pageX - img_container.offset().left);
                        } else {
                            move(touch.pageY - img_container.offset().top);
                        }
                    } else {
                        if (opts.direction === "horizontal") {
                            initial_offset = touch.pageX - img_container.offset().left;
                        } else {
                            initial_offset = touch.pageY - img_container.offset().top;
                        }
                    }
                });
            };
            move = function (coord) {
                if (initial_offset - coord > 5) {
                    initial_offset = coord;
                    image_key = --image_key < 0 ? opts.items.length : image_key;
                } else if (initial_offset - coord < -5) {
                    initial_offset = coord;
                    image_key = ++image_key >= opts.items.length ? 0 : image_key;
                }
                set_frame(image_key);
            };

            preload = function () {
                if (opts.items.length > 0) {
                    var preload_size = opts.items.length * 0.1; // 10%
                    for (i = 0; i <= preload_size; i++) {
                        preload_image(i);
                        preload_image(opts.items.length - i);
                    }
                    // Set first image
                    preload_image(0, true);
                }
            };
            // Init plugin
            init();
            // Preload first and last 10% of image stack;
            preload();
        }
    });
}($));
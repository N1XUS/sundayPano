(function() {
    "use strict";
    $.extend({
        isMobile: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod|Android|Windows Phone|IEMobile/i);
        }
    });
    $.fn.extend({
        sundayPano: function(opts) {
            
            // Predefine global var's
            var elm, 
            init, 
            move, 
            preload, 
            allow, 
            initial_offset, 
            image_key, 
            preloaded, 
            img_container, 
            slider, 
            controls_container,
            set_frame, 
            preload_image, 
            i, 
            default_opts, 
            autoplay, 
            _i, 
            interval_id,
            stop_autoplay;
            
            elm = $(this);
            preloaded = [];
            image_key = 0;
            initial_offset = 0;
            allow = false;
            default_opts = {
                items: [],
                direction: "horizontal",
                control: false,
                autoplay: false,
                autoplay_direction: "<",
                speed: 5,
                width: undefined,
                height: undefined,
                next_button: '<a href="#"><i class="glyphicon glyphicon-chevron-right"></i></a>',
                prev_button: '<a href="#"><i class="glyphicon glyphicon-chevron-left"></i></a>',
                play_button: '<a href="#"><i class="glyphicon glyphicon-play"></i></a>',
                pause_button: '<a href="#"><i class="glyphicon glyphicon-pause"></i></a>',
                before_init: function(opts) {},
                after_init: function(opts) {},
                set_frame: function(frame_id) {},
                on_move: function(coord, initial_offset) {}
            };
            opts = $.extend(default_opts, opts);

            set_frame = function(frame_id) {
                opts.set_frame(frame_id);
                if (preloaded[frame_id] === undefined && opts.items[frame_id] !== undefined) {
                    preload_image(frame_id, true);
                } else if (preloaded[frame_id] !== undefined) {
                    img_container.css({
                        'background-image': "url('" + preloaded[frame_id] + "')"
                    });
                }
                if (preloaded[frame_id + 1] === undefined) {
                    // Preload next image
                    preload_image(frame_id + 1);
                }
                if (preloaded[frame_id - 1] === undefined) {
                    // Preload previous image
                    preload_image(frame_id - 1);
                }
                image_key = frame_id;
                if (opts.control === true) {
                    var add, value;
                    add = (opts.direction === "vertical") ? -1 : 1;
                    value = (frame_id * (100 / opts.items.length)) * add;
                    slider.slider('option', 'value', value);
                }
            };
            preload_image = function(frame_id, set) {
                if (preloaded[frame_id] === undefined && opts.items[frame_id] !== undefined) {
                    var img = $("<img />");
                    if (set === true) {
                        img.attr("src", opts.items[frame_id]).load(function() {
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
            init = function() {
                opts.before_init(opts);
                // Add specific-direction class to element
                elm.addClass("sunday-pano").addClass("direction-" + opts.direction);
                // Create hidden div to store preloaded images
                elm.append('<div class="images-stack hidden"></div>');
                // Create container which will change backgrounds (in order to slider worked)
                img_container = $('<div class="pano-images-container"></div>');
                elm.append(img_container);
                
                if (opts.width === undefined) {
                    // Set width of image equal to width of container
                    opts.width = elm.width();
                }
                if (opts.height === undefined) {
                    // Set height of image equal to height of container
                    opts.height = elm.height();
                }
                
                // Add disable button for enabling native touch events
                if ($.isMobile() !== null) {
                    var dis_button = $('<a href="#" class="sunday-pano-disable-button">&times;</a>');
                    elm.append(dis_button);
                }
                
                // Check if we have jQuery UI Slider
                if (opts.control === true && $.ui === undefined) {
                    console.error("In order to use controls you need to include jQuery UI's slider first");
                    opts.control = false;
                }
                if (opts.control === true) {
                    controls_container = $('<div class="pano-control"></div>');
                    $(controls_container).append($(opts.next_button).addClass("sunday-pano-next-frame"));
                    $(controls_container).append($(opts.prev_button).addClass("sunday-pano-prev-frame"));
                    $(controls_container).append($(opts.play_button).addClass("sunday-pano-autoplay-start"));
                    $(controls_container).append($(opts.pause_button).addClass("sunday-pano-autoplay-pause"));
                    slider = $('<div class="pano-slider"></div>');
                    var params = {};
                    params.value = 0;
                    params.min = 0;
                    params.max = 100;
                    params.step = 100 / opts.items.length;
                    params.orientation = opts.direction;
                    if (opts.direction === "vertical") { // Since slider goes from bottom to top, we need to reverse values
                        params.min = -100;
                        params.max = 0;
                    }
                    params.slide = function(event, ui) {
                        var add, frame;
                        add = (opts.direction === "vertical") ? -1 : 1;
                        frame = (ui.value / (100 / opts.items.length)) * add;
                        set_frame(frame);
                    };
                    params.start = function() {
                        // Stop autoplay
                        stop_autoplay();
                    }
                    slider.slider(params);
                    controls_container.append(slider);
                    elm.append(controls_container);
                    
                    $(document).on("click", ".sunday-pano-next-frame, .sunday-pano-prev-frame, .sunday-pano-autoplay-start, .sunday-pano-autoplay-pause", function(e) {
                        e.preventDefault(); 
                    });
                }
                
                $(document).on("click touchstart", ".sunday-pano-disable-button", function(e) {
                    console.log(e);
                   e.preventDefault();
                   elm.toggleClass("sunday-pano-disabled"); 
                });
                $(img_container).on("mousedown touchstart", function(e) {
                    if (!elm.hasClass("sunday-pano-disabled")) {
                        e.preventDefault();
                        img_container.addClass("sunday-pano-grab");
                        
                        stop_autoplay();
                        
                        allow = true;                        
                    }
                });
                $(document).on("mouseup touchend", function(e) {
                    img_container.removeClass("sunday-pano-grab");
                    e.preventDefault();
                    allow = false;
                });
                $(document).on("mousemove", function(e) {
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
                $(document).on("touchmove", function(e) {
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
                opts.after_init(opts);
            };
            move = function(coord) {
                opts.on_move(coord, initial_offset);
                if (initial_offset - coord > opts.speed) {
                    initial_offset = coord;
                    image_key = --image_key < 0 ? opts.items.length : image_key;
                } else if (initial_offset - coord < (-1 * opts.speed)) {
                    initial_offset = coord;
                    image_key = ++image_key >= opts.items.length ? 0 : image_key;
                }
                set_frame(image_key);
            };
            preload = function() {
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
            autoplay = function() {
                _i = 0;
                elm.addClass("sunday-pano-playing");
                interval_id = setInterval(function(){
                    set_frame(_i);
                    if (opts.autoplay_direction === ">") {
                        _i = _i + 1;
                    } else {
                        _i = _i - 1;
                    }
                    if (_i > opts.items.length) {
                        _i = 0;
                    } else if (_i < 0) {
                        _i = opts.items.length;
                    }
                }, opts.autoplay);
            };
            stop_autoplay = function() {
                if (opts.autoplay !== false && opts.autoplay > 1) {
                    elm.removeClass("sunday-pano-playing");
                    clearInterval(interval_id);
                }
            }
            // Init plugin
            init();
            // Preload first and last 10% of image stack;
            preload();
            if (opts.autoplay !== false && opts.autoplay > 1) {
                autoplay();
            }
        }
    });
}($));
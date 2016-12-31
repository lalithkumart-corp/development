gs.webcam = {
    video : $('#camera-stream'),
    image: $('#snap'),
    start_camera: $('#start-camera'),
    controls: $('.controls'),
    take_photo_btn: $('#take-photo'),
    delete_photo_btn: $('#delete-photo'),
    download_photo_btn: $('#download-photo'),
    error_message: $('#error-message'),
    myStream: [],

    init: function(){
        gs.webcam.initCamera();
        
    },
    initCamera: function(){
          // The getUserMedia interface is used for handling camera input.
    // Some browsers need a prefix so here we're covering all the options
        navigator.getMedia = ( navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

        if(!navigator.getMedia){
            gs.webcam.displayErrorMessage("Your browser doesn't have support for the navigator.getUserMedia interface.");
        }
        else{
            var video = $('#camera-stream');
            // Request the camera.
            navigator.getMedia(
                {
                    video: true
                },
                // Success Callback
                function(stream){

                    // Create an object URL for the video stream and
                    // set it as src of our HTLM video element.
                    $('#camera-stream').attr('src', window.URL.createObjectURL(stream));

                    // Play the video element to start the stream.
                    gs.webcam.myStream.push(stream);
                    video[0].play();
                    video[0].onplay = function() {
                        gs.webcam.showVideo();
                    };
             
                },
                // Error Callback
                function(err){
                    gs.webcam.displayErrorMessage("There was an error with accessing the camera stream: " + err.name, err);
                }
            );
        gs.webcam.bindEvents();
        }
    },
    bindEvents: function(){
         // Mobile browsers cannot play video without user input,
        // so here we're using a button to start it manually.
        $('#start-camera').on("click", function(e){

            e.preventDefault();

            // Start video playback manually.
            gs.webcam.video.play();
            gs.webcam.showVideo();

        });


        $('#take-photo').on("click", function(e){

            e.preventDefault();

            gs.webcam.snap = gs.webcam.takeSnapshot();

            // Show image. 
            $('#snap').attr('src', gs.webcam.snap);
            $('#snap').addClass("visible");

            // Enable delete and save buttons
            $('#delete-photo').removeClass("disabled");
            $('#download-photo').removeClass("disabled");

            // Set the href attribute of the download button to the snap url.
            $('#download-photo').attr('href',gs.webcam.snap);

            // Pause video playback of stream.
            var video = $('#camera-stream');
            video[0].pause();

        });


        $('#delete-photo').on("click", function(e){

            e.preventDefault();

            // Hide image.
            $('#snap').attr('src', "");
            $('#snap').removeClass("visible");

            // Disable delete and save buttons
            $('#delete-photo').addClass("disabled");
            $('#download-photo').addClass("disabled");

            // Resume playback of stream.
            var video = $('#camera-stream');
            video[0].play();

        });
    },
   

    showVideo: function(){
        // Display the video stream and the controls.

        gs.webcam.hideUI();
        $('#camera-stream').addClass("visible");
        $('.controls').addClass("visible");
    },


    takeSnapshot: function(){
        // Here we're using a trick that involves a hidden canvas element.  

        var hidden_canvas = document.querySelector('canvas'),
            context = hidden_canvas.getContext('2d');

        var width = gs.webcam.video.videoWidth,
            height = gs.webcam.video.videoHeight;

        if (width && height) {

            // Setup a canvas with the same dimensions as the video.
            hidden_canvas.width = width;
            hidden_canvas.height = height;

            // Make a copy of the current frame in the video on the canvas.
            context.drawImage(gs.webcam.video, 0, 0, width, height);

            // Turn the canvas image into a dataURL that can be used as a src for our photo.
            return hidden_canvas.toDataURL('image/png');
        }
    },

    displayErrorMessage: function(error_msg, error){
        error = error || "";
        if(error){
            console.error(error);
        }

        $('#error-message').html(error_msg);

        gs.webcam.hideUI();
        $('#error-message').addClass("visible");
    },
   
    hideUI: function(){
        debugger;
        // Helper function for clearing the app UI.

        $('.controls').removeClass("visible");
        $('#start-camera').removeClass("visible");
        $('#camera-stream').removeClass("visible");
        snap.classList.remove("visible");
        $('#error-message').removeClass("visible");
    },

    videoOff: function(){
          var vid = $('#camera-stream');
          vid[0].pause();
          vid.attr('src', "");
          gs.webcam.myStream.getTracks()[0].stop();
          console.log("Vid off");
    }

}

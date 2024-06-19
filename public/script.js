const socket = io("/");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

const user = prompt("Enter your name");

const myVideo = document.createElement("video");
myVideo.muted = true;

let myStream;

navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: true,
    })
    .then((stream) => {
        myStream = stream;
        addVideoStream(myVideo, stream);

        socket.on("user-connected", (userId) => {
            connectToNewUser(userId, stream);
        });

        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });
    })

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
};

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        $("#video_grid").append(video)
    });
};

$(function () {
    $("#show_chat").click(function () {
        $(".left-window").css("display", "none")
        $(".right-window").css("display", "block")
        $(".header_back").css("display", "block")
    })
    $(".header_back").click(function () {
        $(".left-window").css("display", "block")
        $(".right-window").css("display", "none")
        $(".header_back").css("display", "none")
    })

    $("#send").click(function () {
        if ($("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

    $("#chat_message").keydown(function (e) {
        if (e.key == "Enter" && $("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

    $("#mute_button").click(function () {
        const enabled = myStream.getAudioTracks()[0].enabled;
        if (enabled) {
            myStream.getAudioTracks()[0].enabled = false;
            html = `<i class="fas fa-microphone-slash"></i>`;
            $("#mute_button").toggleClass("background_red");
            $("#mute_button").html(html)
        } else {
            myStream.getAudioTracks()[0].enabled = true;
            html = `<i class="fas fa-microphone"></i>`;
            $("#mute_button").toggleClass("background_red");
            $("#mute_button").html(html)
        }
    })

    $("#stop_video").click(function () {
        const enabled = myStream.getVideoTracks()[0].enabled;
        if (enabled) {
            myStream.getVideoTracks()[0].enabled = false;
            html = `<i class="fas fa-video-slash"></i>`;
            $("#stop_video").toggleClass("background_red");
            $("#stop_video").html(html)
        } else {
            myStream.getVideoTracks()[0].enabled = true;
            html = `<i class="fas fa-video"></i>`;
            $("#stop_video").toggleClass("background_red");
            $("#stop_video").html(html)
        }
    })

    // Inside the dollar function $(function(){}) where we have event handlers for all our buttons, we are creating an event handler for clicks on the invite_button (based on the ID of the button).
    $("#invite_button").click(function () {
        // Okay, now can you recall the 2 things our email api requires from the client? 1. URL of the room 2. Email ID of the receiver
        // First lets get the email ID of the person to whom we want to send the invite! We can use the prompt() function of JavaScript!
        const to = prompt("Enter the email address")
        // Let’s create an object where we can save these 2 things -
        let data = {
            // Inside this, let’s first write the code to fetch the current URL of the page. This is the URL with the unique ID of the room, and if our friend joins this URL, then they can enter our room so this will be the URL we would want to share with them to invite them.
            url: window.location.href,//window.location.href -to change the URL of the page in JavaScript, it contains the URL of the current page. It’s value would be our URL that we want to use!
            to: to // Email ID of the receiver
        }
        //Now all that’s left to do is to make a post request to the server on /send-mail API! For that, we can use the AJAX request!
        // The $.ajax() function takes an object with all the details about the request.
        $.ajax({
            // We first tell it about the URL to which we want to send the request, which in our case, it /send-mail.
            url: "/send-mail",
            // Next, we tell it about the type of request that we are trying to make, which is post for us.
            type: "post",
            // Next, we define if we want to send some data with the request. Now make sure that AJAX only sends the data in the form of a string, so we are using JSON.stringify() function to convert our data object to string.
            data: JSON.stringify(data),
            // Next, we tell it about the dataType, which is JSON so that it can tell the server to interpret the data as a JSON when the request is made.
            dataType: 'json',
            // We also tell it about the contentType, to define what kind of content we are sending. It’s value is application/json since it’s a JSON coming out of an application
            contentType: 'application/json',
            // Finally, we have the success and error handlers of our AJAX request, which are just simple functions.
            success: function (result) {
                // In case of success, we are using the alert() function to tell the user that the invite has been sent successfully.
                alert("Invite sent!")
            },
            error: function (result) {
                // In case of error, we are just logging the responseJSON from the error.
                console.log(result.responseJSON)
            }
            // With this, the functionality of our app is completed! Let’s deploy our App on Renderw with the following commands on the project repository -
            // git add .
            //git commit -m “video app complete”
            //git status
            //git remote add origin https://github.com/dpapanicker/C218-VideoChatAppDevOps.git
            //git push origin master --force 

            // let’s test the functionality!
            // Now, open your Render project on the browser and navigate to the deploy section and click on the Manual Deploy - Deploy latest commit.
            // page 11 of pdf -Open your app link and  Click on the invite button so it asks you the email ID of the receiver -Ask the student to enter my email ID, and check if I received the email
            // Click on the link and verify if you both have joined the same room!
            // With this, we have completed all the functionalities of our video chat application! In this application, we also learnt how we can deploy the app on a remote server.We also learnt about WebRTC, PeerJS and built this app using NodeJS! I hope you got to learn a lot while building this application, and had fun. You just successfully built your first full fledged networking application!
            // In the next class, we will be looking into cyber security and deep dive into what vulnerabilities are in applications!
            // ---------------------------------
        })
    })

})

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

socket.on("createMessage", (message, userName) => {
    $(".messages").append(`
        <div class="message">
            <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
        }</span> </b>
            <span>${message}</span>
        </div>
    `)
});
Croquet.startSession("ukaton/croquet", Model, HostView)
    .then(session => {
        const {id, model, view} = session;

        const isVideo = location.href.includes("watch?v=");

        if(isVideo) {
            const video = document.querySelector("video");
                video.id = "video";
            const mute = document.querySelector(`.ytp-mute-button`);
                mute.id = "mute";
            
            view.video = video;
        }

        view.focus();

        window.addEventListener("focus", event => {
            view.focus();
        });
    });
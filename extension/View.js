class RemoteView extends Croquet.View {
    constructor(model) {
        super(model);
        this.model = model;
        window.view = this;
        
        this.subscribe(this.sessionId, {
            event : "update-state",
            handling : "oncePerFrame",
        }, this.updateState);
        this.updateState({state: this.model.state});

        this.previousPageY = undefined;
        this.scrolling = false;
        scroll.addEventListener("touchstart", event => {
            this.scrolling = true;
        });
        scroll.addEventListener("touchend", event => {
            this.scrolling = false;
            delete this.previousPageY;
        });
        scroll.addEventListener("touchmove", event => {
            if(this.scrolling) {
                if(!isNaN(this.previousPageY)) {
                    const pageYDelta = -(event.changedTouches[0].pageY - this.previousPageY);
                    this.publish(this.sessionId, "scroll", 5*pageYDelta);
                }
                this.previousPageY = event.changedTouches[0].pageY;
            }
        });

        this.tilting = false;
        this.defaultTilt = undefined;
        tilt.addEventListener("touchstart", event => {
            this.tilting = true;
        });
        tilt.addEventListener("touchend", event => {
            this.tilting = false;
            delete this.defaultTilt;
        });
        window.addEventListener("deviceorientation", event => {
            if(this.tilting) {
                if(!isNaN(this.defaultTilt)) {
                    const tiltDelta = -(event.beta - this.defaultTilt);
                    this.publish(this.sessionId, "scroll", tiltDelta)
                }
                else
                    this.defaultTilt = event.beta;
            }
        });

        select.addEventListener("click", event => {
            this.publish(this.sessionId, "select");
        });
        
        this.subscribe(this.sessionId, {
            event : "update-rating",
            handling : "oncePerFrame",
        }, this.updateRating);
        like.addEventListener("click", event => {
            if(like.dataset.selected == undefined)
                this.setRating("like");
            else
                this.setRating('');
        });
        dislike.addEventListener("click", event => {
            if(dislike.dataset.selected == undefined)
                this.setRating("dislike");
            else
                this.setRating('');
        });

        this.subscribe(this.sessionId, {
            event : "update-playback-time",
            handling : "oncePerFrame",
        }, this.updatePlaybackTime);
        timeline.addEventListener("input", event => {
            this.setPlaybackTime(timeline.value);
        });
        backward.addEventListener("click", event => {
            this.setPlaybackTime(-10, false);
        });
        forward.addEventListener("click", event => {
            this.setPlaybackTime(10, false);
        });

        this.subscribe(this.sessionId, {
            event : "update-playback-mode",
            handling : "oncePerFrame",
        }, this.updatePlaybackMode);
        playPause.addEventListener("click", event => {
            const newPlaybackMode = (playPause.dataset.playing !== undefined)?
                "pause" :
                "play";
            
            this.setPlaybackMode(newPlaybackMode);
        });

        this.scrubbing = false;
        this.defaultScrub = undefined;
        playPause.addEventListener("touchstart", event => {
            this.scrubbing = true;
        });
        playPause.addEventListener("touchend", event => {
            this.scrubbing = false;
            delete this.defaultScrub;
        });
        window.addEventListener("deviceorientation", event => {
            if(this.scrubbing) {
                if(!isNaN(this.defaultScrub)) {
                    const scrubDelta = (event.gamma - this.defaultScrub);
                    this.setPlaybackTime(scrubDelta/5, false);
                }
                else
                    this.defaultScrub = event.gamma;
            }
        });

        this.subscribe(this.sessionId, {
            event : "update-volume",
            handling : "oncePerFrame",
        }, this.updateVolume);
        volume.addEventListener("input", event => {
            this.publish(this.sessionId, "set-volume", volume.value);
        });

        volume.addEventListener("touchstart", event => {
            this.tilting = true;
        });
        volume.addEventListener("touchend", event => {
            this.tilting = false;
            delete this.defaultTilt;
        });

        this.subscribe(this.sessionId, {
            event : "update-subscription",
            handling : "oncePerFrame",
        }, this.updateSubscription);
        subscribe.addEventListener("click", event => {
            this.publish(this.sessionId, "set-subscription", subscribe.dataset.subscribed == undefined);
        });

        commentTextarea.addEventListener("input", event => {
            this.publish(this.sessionId, "set-comment", commentTextarea.value);

            commentButton.disabled = (commentTextarea.value.length == 0)
        });
        commentButton.addEventListener("click", event => {
            this.publish(this.sessionId, "post-comment");
        });
        this.subscribe(this.sessionId, {
            event : "post-comment",
            handling : "oncePerFrame",
        }, this.postedComment);
    }

    update() {
        if(this.videoToLoad !== undefined && _player.loadVideoById !== undefined) {
            _player.loadVideoById(this.videoToLoad);
            delete this.videoToLoad;
        }

        if(_player !== undefined && _player.getCurrentTime !== undefined)
            timeline.value = _player.getCurrentTime();
    }

    updateState() {
        switch(this.model.state) {
            case "scroll":
                if(_player !== undefined && _player.pauseVideo !== undefined)
                    _player.pauseVideo();

                scrollIntoView("scroll");
                break;
            case "video":
                this.updatePlaybackTime();
                this.updatePlaybackMode();
                scrollIntoView("video");

                this.videoToLoad = this.model.videoId;
                timeline.max = _player.getDuration();
                break;
            default:
                break;
        }
    }


    setRating(rating) {
        this.publish(this.sessionId, "set-rating", rating);
    }

    updateRating(rating) {
        switch(rating) {
            case "like":
                like.dataset.selected = '';
                delete dislike.dataset.selected;
                break;
            case "dislike":
                dislike.dataset.selected = '';
                delete like.dataset.selected;
                break;
            default:
                delete like.dataset.selected;
                delete dislike.dataset.selected;
                break;
        }
    }

    setPlaybackMode(playbackMode) {
        this.publish(this.sessionId, "set-playback-mode", playbackMode);
    }
    updatePlaybackMode(playbackMode) {
        switch(playbackMode) {
            case "play":
                playPause.dataset.playing = '';
                _player.playVideo();
                break;
            case "pause":
                delete playPause.dataset.playing;
                _player.pauseVideo();
                break;
            default:
                break;
        }
    }

    setPlaybackTime(time, isAbsolute = true) {
        const newTime = isAbsolute?
            time :
            _player.getCurrentTime() + time;

        this.publish(this.sessionId, "set-playback-time", newTime);
    }
    updatePlaybackTime(time) {
        _player.seekTo(time);
    }

    postedComment() {
        commentTextarea.value = '';
    }

    setVolume(volume) {
        this.publish(this.sessionId, "set-volume", volume);
    }
    updateVolume(volume) {
        if(Number(volume) == 0) {
            _player.mute();
        }
        else {
            _player.unMute();
        }
    }

    setSubscription() {
        const subscribed = (subscribe.dataset.subscribed !== undefined);
        this.publish(this.sessionId, "update-subscription", !subscribed);
    }
    updateSubscription() {
        if(this.model.subscribed)
            subscribe.dataset.subscribed = '';
        else
            delete subscribe.dataset.subscribed;
    }
}

class HostView extends Croquet.View {
    constructor(model) {
        super(model);
        this.model = model;

        this.subscribe(this.sessionId, {
            event : "scroll",
            handling : "oncePerFrame",
        }, this.scroll);

        this.subscribe(this.sessionId, {
            event : "host-select",
            handling : "oncePerFrame",
        }, this.select);

        this.subscribe(this.sessionId, {
            event : "update-playback-mode",
            handling : "oncePerFrame",
        }, this.updatePlaybackMode);
        this.subscribe(this.sessionId, {
            event : "update-playback-time",
            handling : "oncePerFrame",
        }, this.updatePlaybackTime);

        this.subscribe(this.sessionId, {
            event : "update-rating",
            handling : "oncePerFrame",
        }, this.updateRating);
        
        this.subscribe(this.sessionId, {
            event : "update-comment",
            handling : "oncePerFrame",
        }, this.updateComment);
        this.subscribe(this.sessionId, {
            event : "post-comment",
            handling : "oncePerFrame",
        }, this.postComment);

        this.subscribe(this.sessionId, {
            event : "update-subscription",
            handling : "oncePerFrame",
        }, this.updateSubscription);

        this.links = Array.from(document.querySelectorAll(`ytd-thumbnail > a`));
    }

    scroll(scroll) {
        window.scrollBy(0, scroll);
    }

    update() {
        if(this.model.state == "scroll") {
            const link = this.links.filter(link => link.getBoundingClientRect().y > 0).sort((a, b) => {
                return a.getBoundingClientRect().y - b.getBoundingClientRect().y
            })[0];

            if(link !== undefined && this.selectedLink !== link) {
                if(this.selectedLink !== undefined) {
                    this.selectedLink.style.border = '';
                }
                this.selectedLink = link;
                this.selectedLink.style.border = "solid blue 10px";
            }
        }
        else if(this.model.state == "video") {
            if(this.commentTextarea == undefined) {
                const commentTextarea = document.querySelector(`[aria-label="Add a public comment..."]`);
                if(commentTextarea !== null) {
                    this.commentTextarea = commentTextarea;
                }
            }
        }

    }

    select() {
        if(this.model.state == "scroll" &&  this.selectedLink !== undefined) {
            location.href = this.selectedLink.href;
        }
    }

    focus() {
        const state = (this.video !== undefined)?
            "video" :
            "scroll";
        
        this.publish(this.sessionId, "set-state", {
            state,
            videoId : location.href.split('=')[1],
        });
    }

    get video() {
        return this._video;
    }
    set video(video) {
        this._video = video;

        this.like = document.querySelector(`[aria-label^="like"]`);
        this.dislike = document.querySelector(`[aria-label^="dislike"]`);
        this.subscribe = document.querySelector(`paper-button[aria-label^="Subscribe"]`);

        video.pause();
        video.currentTime = 0;
        if(!video.muted)
            mute.click();
    }

    updatePlaybackMode(playbackMode) {
        if(this.video !== undefined) {
            switch(playbackMode) {
                case "play":
                    this.video.play();
                    break;
                case "pause":
                    this.video.pause();
                    break;
            }
        }
    }
    updatePlaybackTime(playbackTime) {
        if(this.video !== undefined)
            this.video.currentTime = playbackTime;
    }

    updateRating(rating) {
        switch(rating) {
            case "like":
                this.like.click();
                break;
            case "dislike":
                this.dislike.click();
                break;
            default:
                if(this.currentRating == "like")
                    this.like.click();
                else if(this.currentRating == "dislike")
                    this.dislike.click();
                break;
        }
        this.currentRating = rating
    }

    updateSubscription() {
        if(this.model.subscribed)
            this.subscribe.click();
    }

    updateComment() {
        if(this.commentTextarea !== undefined) {
            this.commentTextarea.innerText = this.model.comment;
        }
    }
    postComment() {
        if(this.commentTextarea !== undefined) {
            const commentButton = document.querySelector(`paper-button[aria-label="Comment"]`);
            commentButton.click();
        }
    }
}
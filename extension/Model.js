class Model extends Croquet.Model {
    init() {
        this.state = "scroll";
        this.subscribed = false;

        this.subscribe(this.sessionId, "set-state", this.updateState);

        this.subscribe(this.sessionId, "scroll", this.scroll);
        this.subscribe(this.sessionId, "select", this.select);

        this.subscribe(this.sessionId, "set-playback-mode", this.setPlaybackMode);
        this.subscribe(this.sessionId, "set-playback-time", this.setPlaybackTime);

        this.subscribe(this.sessionId, "set-rating", this.setRating);
        this.subscribe(this.sessionId, "set-volume", this.setVolume);

        this.subscribe(this.sessionId, "set-subscription", this.setSubscription);

        this.subscribe(this.sessionId, "set-comment", this.setComment);
        this.subscribe(this.sessionId, "post-comment", this.postComment);

    }

    updateState(data) {
        this.state = data.state;
        this.videoId = data.videoId;

        this.publish(this.sessionId, "update-state", data);
    }

    scroll(scroll) {
        this.publish(this.sessionId, "scroll", scroll);
    }

    select() {
        this.publish(this.sessionId, "host-select");
    }

    setPlaybackMode(playbackMode) {
        this.publish(this.sessionId, "update-playback-mode", playbackMode)
    }

    setPlaybackTime(playbackTime) {
        this.publish(this.sessionId, "update-playback-time", playbackTime)
    }

    setRating(rating) {
        this.rating = rating;
        this.publish(this.sessionId, "update-rating", rating);
    }

    setVolume(volume) {
        this.volume = volume;
        this.publish(this.sessionId, "update-volume", volume);
    }

    setSubscription(subscribed) {
        this.subscribed = subscribed;
        this.publish(this.sessionId, "update-subscription", this.subscribed);
    }

    setComment(comment) {
        this.comment = comment;
        this.publish(this.sessionId, "update-comment", this.comment);
    }
    postComment() {
        this.publish(this.sessionId, "post-comment");
    }
}

Model.register();
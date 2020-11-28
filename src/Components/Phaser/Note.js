"use strict";
class Note {
  constructor(follower) {
    this.follower = follower;
    this.intervalID = undefined;
    this.score = 1;
  } 

  getFollower() {
      return this.follower;
  }

  getIntervalID() {
      return this.intervalID;
  }

  getScore() {
      return this.score
  }

  setIntervalID(intervalID) {
      this.intervalID = intervalID;
  }

  incrementScore() {
      this.score++;
  }
}

// default export
export default Note;
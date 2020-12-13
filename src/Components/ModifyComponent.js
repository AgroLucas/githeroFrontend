import {RedirectUrl} from "./Router.js";
import {getUserSessionData} from "../utils/Session.js";

let user;

const Modify = (beatmapID) => {
    user = getUserSessionData();

    if(!user || !beatmapID || beatmapID < 0){
        RedirectUrl("/list");
    }
    
    fetch("/api/beatmaps/"+beatmapID)
    .then((response) => {
        if (!response.ok) throw new Error("Error code : " + response.status + " : " + response.statusText);
        return response.json();
      })
      .then((data) => onResponse(data))
      .catch((err) => onError(err));
}

const onError = (err) => {
    console.log(err.message);
    RedirectUrl("/list");
}

const onResponse = (data) => {
    if(user.username === data.bmCreator){
        let beatmap = {
            beatmapID: data.beatmapID,
            difficulty: data.difficulty,
            title: data.musicTitle,
            audioData: data.musicData,
            artist: data.musicArtist,
            duration: data.musicDuration,
            modify: true,
            noteList: data.noteList
        }
        RedirectUrl("/edit", beatmap);
    }else {
        console.log("User not beatmap creator: redirect to /list");
        RedirectUrl("/list");
    }
}

export default Modify;
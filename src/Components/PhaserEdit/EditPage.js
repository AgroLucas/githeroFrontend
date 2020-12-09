import { RedirectUrl } from "../Router.js";
import { getUserSessionData } from "../../utils/Session.js";
import EditScene from "./EditScene.js";
import Phaser from "phaser";

let page = document.querySelector("#page");

let pageHtml = `
<div class="row mt-5 mr-2">
    <div class="col-11"></div>
    <div class="col-1 pr-2">
        <button class="btn btn-danger p-3">Publier</button>
    </div>
</div>
<div class="row mt-5 ml-5 mr-2">
    <div id="editScreen" class="col-10">
    </div>
    <div class="col-1"></div>
    <div class="col-1 pr-2 my-5">
        <div class="btn-group-vertical">
            <button type="button" class="btn btn-primary py-3 active">Simple</button>
            <button type="button" class="btn btn-primary py-3">Longues</button>
        </div>
    </div>
</div>
<div class="row mt-5 ml-5 mr-2">
    <div class="col-10">
        <input id="timeLine" type="range" class="form-control-range" min="0" max="1" step="0.001" value="0"/>
    </div>
    <div class="col-1">
        <button class="btn btn-secondary">Play/Pause</button>
    </div>
    <div class="col-1">
        <p><span id="currentTime">00:00</span>/<span>00:45</span></p>
    </div>
</div>
<div class="row mt-5">
    <div class="col-3"></div>
    <div class="col-6">
        <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div><span id="errorMessage"></span>
    </div>
</div>
`;

/*
let ldd = [[0, 0, 3500], [0, 1, 3780], [0, 0, 4100], [0, 1, 4420], //libre de droits ... 
    [0, 3, 7320], [0, 2, 7630], [0, 1, 7975], [0, 0, 8310], [0, 1, 8640], [0, 2, 8890], [1, 3, 9185, 9975], // générique libre de droiiits ...
    [0, 0, 10740], [0, 1, 11010], [0, 0, 11300], [0, 1, 11605], // (libre de droits...)
    [0, 2, 12300], [0, 3, 12300], [0, 0, 12650], [0, 1, 12650], [0, 2, 13065], [0, 3, 13065], [0, 0, 13395], [0, 3, 13395], [0,1,13675], [0,2,13675], [0, 0, 13960], [0, 3, 13960], //cette chanson est à moi ... (double)
    [0, 3, 15190], [0, 2, 15435], [0, 3, 15790], [0, 2, 16100], [0, 3, 16410], // YouTube l'enlève pas ...
    [0, 0, 17615], [0, 1, 17890], [0, 0, 18195], [0, 1, 18496], [0, 0, 18738], // c'est libre de doits ...
    [1, 3, 19550, 20000], [1, 2, 20000, 20600], [1, 1, 20600, 21230], [1, 0, 21230, 22100], // liiiiiibreuuuuuuuh deuuuuuuuuuh droiiiiiiiits ...
    [0, 2, 22650], [0, 0, 22990], [0, 3, 23255], [0, 1, 23565], // libre de droits ...
    [0, 0, 26540], [0, 1, 26750], [0, 0, 27135], [0, 1, 27455], [0, 0, 27810], [0, 1, 28095], [1, 0, 28395, 29185], [1, 1, 28395, 29185], //générique libre de droiiits ...
    [0, 3, 29930], [0, 2, 30200], [0, 1, 30630], [0, 0, 30845],  //(libre de droiiits ...)
    [0, 0, 31670], [0, 1, 31985], [0, 2, 32280], [0, 3, 32530], [0, 3, 32875], [0, 2, 33210],   //cette chanson est à moi ... (double) 
    [0, 0, 34385], [0, 1, 34650], [0, 0, 35015], [0, 1, 35300], [0, 0, 35610], //YouTube l'enlèves pas ...
    [0, 0, 36810], [0, 2, 36810], [0, 1, 37100], [0, 3, 37100], [0, 0, 37420], [0, 2, 37420], [0, 1, 37700], [0, 3, 37700], [1, 0, 38020, 38840], [1, 2, 38020, 38840], // c'est libre de droits.
    [0, 1, 40665], //Libre ...
    [0, 1, 41710], [0, 0, 41920] // de droits.
]
*/

const EditPage = (data) => {
    /*
    if(!data){
        RedirectUrl("/addBeatmap");
        return;
    }
    let user = getUserSessionData();
    if(!user){
        RedirectUrl("/");
        return;
    }
    console.log(user);

    let beatmap = {
        noteList: ldd,
        difficulty: data.difficulty,
        musicTitle: data.title,
        musicData: data.audioData,
        musicArtist: data.artist,
        musicDuration: data.duration,
        bmCreator: user.username "Baptiste",
    }
    */

    page.innerHTML = pageHtml;

    const editScreenWidth = 4/5 * window.innerWidth; 
    const editScreenHeight = 1/2 * window.innerHeight;
    const duration = 45000;

    let scene = new EditScene(editScreenWidth, editScreenHeight, duration)

    let config = {
        type: Phaser.AUTO,
        width: editScreenWidth,
        height: editScreenHeight,
        backgroundColor: '#FFFFFF',
        scene: [scene],
        parent: "editScreen",
    }

    let game = new Phaser.Game(config);
    
    let timeLine = document.querySelector("#timeLine");
    timeLine.addEventListener("change", ()=> {
        let time = duration * timeLine.value;
        console.log("update time to "+time);
        scene.updateCurrentTime(time);
    })

    /*
    let btn = document.querySelector("#publish");
    btn.addEventListener("click", () => {publish(beatmap, user)});
    */

    return game;
}

const publish = (beatmap, user) => {
    fetch("/api/beatmaps/",{
        method: "POST",
        body: JSON.stringify(beatmap),
        headers: {
            Authorization: user.token,
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) throw new Error("Error code : " + response.status + " : " + response.statusText);
            return response.json();
        })
        .then((data) => onBeatmapPublication(data))
        .catch((err) => onError(err));
}


const onBeatmapPublication = (data) => {
    console.log("Success: res = ", data);
}

const onError = (err) => {
    let messageBoard = document.querySelector("#messageBoard");
    let errorMessage = err.message;
    messageBoard.innerText = errorMessage;
    // show the messageBoard div (add relevant Bootstrap class)
    messageBoard.classList.add("d-block");  
};

export default EditPage;
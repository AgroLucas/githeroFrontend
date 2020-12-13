"use strict";
import {getUserSessionData} from "../utils/Session.js";
import {detectMob} from "../utils/Utils.js"
import { RedirectUrl } from "./Router.js";


let page = document.querySelector("#page");

const MusicListPage = (message) => {
    loadBeatmap(message);
}
// modifier bloquer et debloquer 
const loadBeatmap = async (message) => {
    if (!message)
        message=""
    let buttonHtml = "";
    let modalHtml = "";
    let user = getUserSessionData();
    user = user ? user : {username: null};
    let admin = false;
    if (user.username)
        admin = await isAdmin(user);
    await fetch("/api/beatmaps/list/" + user.username).then(response => {
        if(!response.ok){
            throw new Error(response.status + " " + response.statusText);
        }
        return response.json();
    }).then(response => {
        response.forEach(element => {
            if (!(element.beatmapID >= 0 && !element.isActive && !admin && (!user || (user && user.username !== element.creator)) )) {   
                buttonHtml += `<button type="button" class="btn button_music mx-auto mx-md-5 my-5 py-5" data-toggle="modal" data-target="#myModal` + element.beatmapID +`">` + getTitleAndAuthor(element) + `</button>`;
                modalHtml += `
                <div class="modal fade" id="myModal` + element.beatmapID + `">
                    <div class="modal-dialog modal-xl">
                        <div class="modal-content">
                            <!-- Modal Header -->
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                            </div>
                            <!-- Modal Body -->
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-4 ">
                                        <table class="table table-dark text-center">
                                            <thead>
                                                <tr><th colspan="3"><h5>Meilleurs Scores</h5></th></tr>
                                            </thead>
                                            <tbody>`
                                            let cmpt = 0;
                                            for(let i = 0; i < 5 && i < element.leaderboard.length; i++) {
                                                if (user && user.username == element.leaderboard[i].username)
                                                    modalHtml+=`<tr class="text-warning">`
                                                else
                                                    modalHtml+=`<tr>`;
                                                modalHtml+=`
                                                    <td>` + (i+1) + `</td>
                                                    <td>` + element.leaderboard[i].username + `</td>
                                                    <td>` + element.leaderboard[i].score + `</td>
                                                </tr>`
                                                cmpt++;
                                            }
                                            for(let i = cmpt; i<5; i++) {
                                                modalHtml+=`
                                                <tr>
                                                    <td>` + (i+1) + `</td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>`
                                            }
                                            modalHtml+=`
                                            </tbody>
                                        </table>
                                        <div class="text-center">
                                            <h4>Difficulté : ` + getDifficultyWithColor(element) + `</h4>
                                        </div>
                                    </div>
                                    <div class="music_info_leaderboard col-md-7 mx-auto mr-md-0 text-center text-md-left">
                                        <p><h4>` + element.musicTitle + `</h4></p>
                                        <p>Durée : ` + convertMsToDisplay(element.musicDuration) + `</p>
                                        <p>Auteur : ` + element.musicArtist + `</p>
                                        <p>Créateur du niveau : ` + element.creator + `</p>
                                        <p>Votre meilleur score : ` + element.highscore + ` points</p>
                                    </div>
                                </div>
                            </div>
                            <!-- Modal Footer -->
                            <div class="d-flex justify-content-center mb-3">
                            `
                            if (element.isActive || element.beatmapID < 0)
                                modalHtml += `<button type="button" id="`+element.beatmapID+`" class="btn btn-danger music_info_play_button playBtn" href="#" data-uri="/game"><h5 id="`+element.beatmapID+`" href="#" data-uri="/game">Jouer</h5></button> </div>`;
                            else
                                modalHtml += `<button type="button" id="`+element.beatmapID+`" class="btn btn-danger active music_info_play_button blockedBtn"><h5 id="`+element.beatmapID+`">La beatmap à été désactivée par un admin. Elle n'est plus visible par les autres utilisateurs.</h5></button> </div>`;
                
                            if (admin) {
                                if (element.beatmapID >= 0) {
                                    if (element.isActive) {
                                        modalHtml += `
                                        <div class="d-flex justify-content-center mt-5 mb-3">
                                            <button type="button" id="`+element.beatmapID+`" class="btn btn-warning changeActive"><h5>Bloquer</h5></button>
                                        </div>`;
                                    } else {
                                        modalHtml += `
                                        <div class="d-flex justify-content-center mt-5 mb-3">
                                            <button type="button" id="`+element.beatmapID+`" class="btn btn-warning changeActive"><h5>Débloquer</h5></button>
                                        </div>`;
                                    }               
                                }
                            }
                            if (!detectMob() && user.username === element.creator && element.beatmapID >= 0) { 
                                modalHtml += `
                                <div class="d-flex justify-content-center mt-5 mb-3">
                                    <button type="button" id="`+element.beatmapID+`" class="btn btn-secondary modify"><h5>Modifier</h5></button>
                                </div>`;
                            }
                        modalHtml += `      
                        </div>
                    </div>
                </div>`;
            }                   
        });    
        let pageHtml = `<div class="text-center font-weight-bold">` + message + `</div><div id="button_page" class="d-flex flex-md-row flex-sm-column justify-content-start flex-wrap">` + buttonHtml + `</div><div id="modal_page">` + modalHtml + `</div>`;
        page.innerHTML = pageHtml;

        document.querySelectorAll(".playBtn").forEach(element => {
            element.addEventListener("click", redirectGame);
        });

        document.querySelectorAll(".changeActive").forEach(element => {
            let playBtn;
            document.querySelectorAll(".playBtn").forEach(playB => {
                if (playB.id == element.id) {
                    playBtn = playB;
                }
            });
            document.querySelectorAll(".blockedBtn").forEach(playB => {
                if (playB.id == element.id) {
                    playBtn = playB;
                }
            });
            element.addEventListener("click", () =>  changeActive(element, user, playBtn))                       
        });

        document.querySelectorAll(".modify").forEach(element => {
            element.addEventListener("click", () =>  RedirectUrl("/modify", element.id));                       
        });

    });
}

const getTitleAndAuthor = (music) => {
    return "<h5>" + music.musicTitle + "</h5></br> by " + music.musicArtist;
}

const getDifficultyWithColor = (music) => {
  if(music.difficulty == "Facile") return '<span class="badge badge-success">' + music.difficulty + '</span>';
  if(music.difficulty == "Moyen") return '<span class="badge badge-warning">' + music.difficulty + '</span>';
  else return '<span class="badge badge-danger">' + music.difficulty + '</span>';
}

const redirectGame = (e) => {
    RedirectUrl("/game", e.target.id);
}

const changeActive = async (button, user, playBtn) => {
    let isActive = button.childNodes[0].innerHTML+"";
    if (isActive === "Bloquer") {
        button.childNodes[0].innerHTML = "Processing";
        await setActive("false", user, button.id);
        button.childNodes[0].innerHTML = "Débloquer";
        playBtn.childNodes[0].innerHTML = "La beatmap à été désactivée par un admin. Elle n'est plus visible par les autres utilisateurs."
        playBtn.removeEventListener("click", redirectGame)
    } else if (isActive === "Débloquer") {
        button.childNodes[0].innerHTML = "Processing";
        await setActive("true", user, button.id);
        button.childNodes[0].innerHTML = "Bloquer";
        playBtn.childNodes[0].innerHTML = "Jouer"
        playBtn.addEventListener("click", redirectGame)
    }
}

const setActive = async (flag, user, beatmapID) => {
    let username = {username: user.username};
    await fetch("/api/beatmaps/setActive/"+flag+"/"+beatmapID, {
        method: "PATCH", // *GET, POST, PUT, DELETE, etc.
        body: JSON.stringify(username), // body data type must match "Content-Type" header
        headers: {
            Authorization: user.token,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok)
            throw new Error(
              "Error code : " + response.status + " : " + response.statusText
            );
        })
        .catch((err) => console.log(err));
}

const isAdmin = async (user) => {
    let isAdmin = false;
    let username = {username: user.username};
    await fetch("/api/users/isAdmin", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        body: JSON.stringify(username), // body data type must match "Content-Type" header
        headers: {
            Authorization: user.token,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok)
            throw new Error(
              "Error code : " + response.status + " : " + response.statusText
            );
            return response.json();
        }).then((data) => isAdmin = data.isAdmin)
        .catch((err) => console.log(err));
        return isAdmin;
}

const convertMsToDisplay = (time) => {
    let allSeconds = Math.floor(time/1000);
    let seconds = allSeconds%60;
    let minutes = Math.floor(allSeconds/60);
    if(seconds < 10){
        seconds = "0"+seconds;
    }
    if(minutes < 10){
        minutes = "0"+minutes;
    }
    let res = minutes + ":" + seconds;
    return res;
}

export default MusicListPage;

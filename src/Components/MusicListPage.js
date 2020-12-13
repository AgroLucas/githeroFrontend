"use strict";
import {searchForPlayBtns} from "./Router.js";
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
                                            modalHtml+=`
                                            <tr>
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
                                <div class="music_info_leaderboard">
                                    <p><h4>` + element.musicTitle + `</h4></p>
                                    <p>Durée : ` + (Math.floor(element.musicDuration/1000/60)) + `:` + (Math.floor(element.musicDuration/1000)%60) + `</p>
                                    <p>Auteur : ` + element.musicArtist + `</p>
                                    <p>Créateur du niveau : ` + element.creator + `</p>
                                    <p>Votre meilleur score : ` + element.highscore + ` points</p>
                                </div>
                            </div>
                        </div>
                        <!-- Modal Footer -->
                        <div class="d-flex justify-content-center mb-3">
                            <button type="button" id="`+element.beatmapID+`" class="btn btn-danger music_info_play_button playBtn" href="#" data-uri="/game"><h5 href="#" data-uri="/game">Jouer</h5></button>
                        </div>`
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
                                <button type="button" id="`+element.beatmapID+`" class="btn modify"><h5>Modifier</h5></button>
                            </div>`;
                        }
                    modalHtml += `      
                    </div>
                </div>
            </div>`;                   
        });    
        let pageHtml = `<div class="text-center font-weight-bold">` + message + `</div><div id="button_page" class="d-flex flex-md-row flex-sm-column justify-content-start flex-wrap">` + buttonHtml + `</div><div id="modal_page">` + modalHtml + `</div>`;
        page.innerHTML = pageHtml;
        document.querySelectorAll(".playBtn").forEach(element => {
            element.addEventListener("click", () => RedirectUrl("/game", element.id));
        });
        document.querySelectorAll(".changeActive").forEach(element => {
            element.addEventListener("click", () =>  changeActive(element, user));                    
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


const changeActive = async (button, user) => {
    let isActive = button.childNodes[0].innerHTML+"";
    if (isActive === "Bloquer") {
        button.childNodes[0].innerHTML = "Processing"
        await setActive("false", user, button.id);
        button.childNodes[0].innerHTML = "Débloquer"
    } else if (isActive === "Débloquer") {
        button.childNodes[0].innerHTML = "Processing"
        await setActive("true", user, button.id);
        button.childNodes[0].innerHTML = "Bloquer"
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

export default MusicListPage;

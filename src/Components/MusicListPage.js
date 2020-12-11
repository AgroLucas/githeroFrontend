"use strict";
import {searchForPlayBtns} from "./Router.js";
import {getUserSessionData} from "../utils/Session.js";
import {RedirectUrl} from "./Router.js";


let page = document.querySelector("#page");

const MusicListPage = (message) => {
    loadBeatmap(message);
}

const loadBeatmap = async (message) => {
    if (!message)
        message=""
    let buttonHtml = "<div class=\"text-center font-weight-bold\">" + message + "</div>";
    let modalHtml = "";
    let user = getUserSessionData();
    user = user ? user : {username: null};
    await fetch("/api/beatmaps/list/" + user.username).then(response => {
        if(!response.ok){
            throw new Error(response.status + " " + response.statusText);
        }
        return response.json();
    }).then(response => {
        console.log(response);
        for(const ELEMENT of response){
            buttonHtml += `<button type="button" class="btn btn-primary button_music" data-toggle="modal" data-target="#myModal` + ELEMENT.beatmapID +`">` + getTitleAndAuthor(ELEMENT) + `</button>`;
            modalHtml += `
                <div class="modal fade" id="myModal` + ELEMENT.beatmapID + `">
                    <div class="modal-dialog modal-xl" >
                        <div class="modal-content">
                        <!-- Modal Header -->
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                            </div>
                        <!-- Modal Body -->
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-4 ">
                                        <table class="table table-dark" style="text-align: center;">
                                            <thead>
                                                <tr><th colspan="3"><h5>Meilleurs Scores</h5></th></tr>
                                            </thead>
                                            <tbody>`
            for(let i = 0; i < 5 && i < ELEMENT.leaderboard.length; i++) {
                modalHtml+=`
                                                <tr>
                                                    <td>` + i+1 + `</td>
                                                    <td>` + ELEMENT.leaderboard[i].username + `</td>
                                                    <td>` + ELEMENT.leaderboard[i].score + `</td>
                                                </tr>`
            }
            modalHtml+=`
                                            </tbody>
                                        </table>
                                        <div style="text-align: center;"><h4>Difficulté : ` + getDifficultyWithColor(ELEMENT) + `</h4></div>
                                    </div>
                                    <div class="music_info_leaderboard">
                                        <p><h4>` + ELEMENT.musicTitle + `</h4></p>
                                        <p>Durée : ` + (Math.floor(ELEMENT.musicDuration/1000/60)) + `:` + (Math.floor(ELEMENT.musicDuration/1000)%60) + `</p>
                                        <p>Auteur : ` + ELEMENT.musicArtist + `</p>
                                        <p>Créateur du niveau : ` + ELEMENT.creator + `</p>
                                        <p>Votre meilleur score : ` + ELEMENT.highscore + ` points</p>
                                    </div>
                                </div>
                            </div>
                        <!-- Modal Footer -->
                            <div class="d-flex justify-content-center mb-3">
                                <button type="button" id="`+ELEMENT.beatmapID+`" class="btn btn-danger music_info_play_button playBtn" href="#" data-uri="/game"><h5 href="#" data-uri="/game">Jouer</h5></button>       
                            </div>
                        </div>
                    </div>
                </div>`;
        }

        let pageHtml = `<div id="button_page">` + buttonHtml + `</div><div id="modal_page">` + modalHtml + `</div>`;
        page.innerHTML = pageHtml;

        /*
        let allPlayBtns = document.querySelectorAll(".playBtn");
        allPlayBtns.forEach(playBtn => {
            let beatmapID = playBtn.id;
            playBtn.addEventListener("click", RedirectUrl("/game", beatmapID));            
        });
        */
        searchForPlayBtns();
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

export default MusicListPage;

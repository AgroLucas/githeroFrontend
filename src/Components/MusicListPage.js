"use strict";
import {searchForPlayBtns} from "./Router.js";
import {getUserSessionData} from "../utils/Session.js";
import {RedirectUrl} from "./Router.js";


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
    await fetch("/api/beatmaps/list/" + user.username).then(response => {
        if(!response.ok){
            throw new Error(response.status + " " + response.statusText);
        }
        return response.json();
    }).then(response => {
        if(user.username === "anistricks" || user.username === "Baptiste" || user.username === "Metalucas" ||user.username  === "Bastien"  ){
            console.log(response);
            for(const ELEMENT of response){
                buttonHtml += `<button type="button" class="btn button_music mx-auto mx-md-5 my-5 py-5" data-toggle="modal" data-target="#myModal` + ELEMENT.beatmapID +`">` + getTitleAndAuthor(ELEMENT) + `</button>`;
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
                                            <table class="table table-dark text-center">
                                                <thead>
                                                    <tr><th colspan="3"><h5>Meilleurs Scores</h5></th></tr>
                                                </thead>
                                                <tbody>`
                let cmpt = 0;
                for(let i = 0; i < 5 && i < ELEMENT.leaderboard.length; i++) {
                    modalHtml+=`
                                                    <tr>
                                                        <td>` + (i+1) + `</td>
                                                        <td>` + ELEMENT.leaderboard[i].username + `</td>
                                                        <td>` + ELEMENT.leaderboard[i].score + `</td>
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
                                            <div class="text-center"><h4>Difficulté : ` + getDifficultyWithColor(ELEMENT) + `</h4></div>
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
                                <div class="d-flex justify-content-center mb-3">
                                 <button type="button" id="`+ELEMENT.beatmapID+`" class="btn btn-warning" >Bloquer</h5></button>
                                </div>
                                <div class="d-flex justify-content-center mb-3">
                                 <button type="button" id="`+ELEMENT.beatmapID+`" class="btn btn-warning" href="#" data-uri="/game"><h5 href="#" data-uri="/game">Debloquer</h5></button>
                                </div>
                                
                            </div>
                        </div>
                    </div>`;
            }

        }else{
        console.log(response);
        for(const ELEMENT of response){
            buttonHtml += `<button type="button" class="btn button_music mx-auto mx-md-5 my-5 py-5" data-toggle="modal" data-target="#myModal` + ELEMENT.beatmapID +`">` + getTitleAndAuthor(ELEMENT) + `</button>`;
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
                                        <table class="table table-dark text-center">
                                            <thead>
                                                <tr><th colspan="3"><h5>Meilleurs Scores</h5></th></tr>
                                            </thead>
                                            <tbody>`
            let cmpt = 0;
            for(let i = 0; i < 5 && i < ELEMENT.leaderboard.length; i++) {
                modalHtml+=`
                                                <tr>
                                                    <td>` + (i+1) + `</td>
                                                    <td>` + ELEMENT.leaderboard[i].username + `</td>
                                                    <td>` + ELEMENT.leaderboard[i].score + `</td>
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
                                        <div class="text-center"><h4>Difficulté : ` + getDifficultyWithColor(ELEMENT) + `</h4></div>
                                    </div>
                                    <div class="music_info_leaderboard col-md-7 mx-auto mr-md-0 text-center text-md-left">
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
    }

        let pageHtml = `<div class="text-center font-weight-bold">` + message + `</div><div id="button_page" class="d-flex flex-md-row flex-sm-column justify-content-start flex-wrap">` + buttonHtml + `</div><div id="modal_page">` + modalHtml + `</div>`;
        page.innerHTML = pageHtml;

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

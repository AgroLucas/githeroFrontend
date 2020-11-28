import {searchForPlayBtns} from "./Router.js";

"use strict";

let page = document.querySelector("#page");

class Music {
    constructor(id, title, author, mapCreator, duration, difficulty) {
      this.id = id;
      this.title = title;
      this.author = author;
      this.mapCreator = mapCreator;
      this.duration = duration;
      this.difficulty = difficulty;
    }

    getTitleAndAuthor() {
        return "<h5>" + this.title + "</h5></br> by " + this.author;
    }

    getDifficultyWithColor() {
      if(this.difficulty == "Facile") return '<span class="badge badge-success">' + this.difficulty + '</span>';
      if(this.difficulty == "Moyen") return '<span class="badge badge-warning">' + this.difficulty + '</span>';
      else return '<span class="badge badge-danger">' + this.difficulty + '</span>';
    }
}

let music1 = new Music(1,"Titre1","Auteur1","créateur1",150,"Facile");
let music2 = new Music(2,"Titre2","Auteur2","créateur2",160,"Moyen");
let music3 = new Music(3,"Titre3","Auteur3","créateur3",170,"Difficile");
let music4 = new Music(4,"Titre4","Auteur4","créateur4",180,"Facile");
let music5 = new Music(5,"Titre5","Auteur5","créateur5",190,"Moyen");
let music6 = new Music(6,"Titre6","Auteur6","créateur6",140,"Difficile");
let music7 = new Music(7,"Titre7","Auteur7","créateur7",130,"Facile");
let music8 = new Music(8,"Titre8","Auteur8","créateur8",120,"Moyen");
let music9 = new Music(9,"Titre9 avec un nom très très très très long","Auteur9 avec un nom très très très long","créateur9 avec un nom très très très long",110,"Difficile");
let music10 = new Music(10,"Titre10","Auteur10","créateur10",120,"Difficile");

const TABMUSIC = [music1,music2,music3,music4,music5,music6,music7,music8,music9,music10];

let buttonHtml = "";
let modalHtml = "";

for(const ELEMENT of TABMUSIC){
    buttonHtml += `<button type="button" class="btn btn-primary button_music" data-toggle="modal" data-target="#myModal` + ELEMENT.id +`">` + ELEMENT.getTitleAndAuthor() + `</button>`;

    modalHtml += `
<div class="modal fade" id="myModal` + ELEMENT.id + `">
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
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Pseudo</td>
                                    <td>Score</td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>Pseudo</td>
                                    <td>Score</td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td>Pseudo</td>
                                    <td>Score</td>
                                </tr>
                                <tr>
                                    <td>4</td>
                                    <td>Pseudo</td>
                                    <td>Score</td>
                                </tr>
                                <tr>
                                    <td>5</td>
                                    <td>Pseudo</td>
                                    <td>Score</td>
                                </tr>
                            </tbody>
                        </table>
                        <div style="text-align: center;"><h4>Difficulté : ` + ELEMENT.getDifficultyWithColor() + `</h4></div>
                    </div>
                    <div class="music_info_leaderboard">
                        <p><h4>` + ELEMENT.title + `</h4></p>
                        <p>Durée : ` + ELEMENT.duration + ` secondes</p>
                        <p>Auteur : ` + ELEMENT.author + `</p>
                        <p>Créateur du niveau : ` + ELEMENT.mapCreator + `</p>
                        <p>Votre meilleur score : monMeilleurScore</p>
                        <p>Vous êtes classé placeClassement</p>
                    </div>
                </div>
            </div>
        <!-- Modal Footer -->
            <div class="d-flex justify-content-center mb-3">
                <button type="button" class="btn btn-danger music_info_play_button playBtn" href="#" data-uri="/game"><h5 href="#" data-uri="/game">Jouer</h5></button>       
            </div>
        </div>
    </div>
</div>`;
}

let pageHtml = `<div id="button_page">` + buttonHtml + `</div><div id="modal_page">` + modalHtml + `</div>`

const MusicListPage = () => {
    page.innerHTML = pageHtml;
    searchForPlayBtns();
}

export default MusicListPage;

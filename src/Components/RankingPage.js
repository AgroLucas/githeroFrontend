import {getUserSessionData} from "../utils/Session.js";

let page = document.querySelector("#page");

const RankingPage = () => {
    loadScoreboard();
}

const loadScoreboard = async () => {
    await fetch("/api/users/totalscore").then(response => {
        if(!response.ok){
            throw new Error(response.status + " " + response.statusText);
        }
        return response.json();
    }).then( response =>{
        let user = getUserSessionData();
        let index = 1;
        let content = "";
        let rankMessage = "Vous n'êtes pas dans le classement";
        response.totalscore.every(element => {
            if (index==51)
                return false;
            if (element.totalHighscore == 0)
                return false;
            if (user && user.username == element.username) {
                if (index===1)
                    rankMessage = "Vous êtes " + index + "er";
                else
                    rankMessage = "Vous êtes " + index + "ème";
                content += `
                <tr>
                    <td class="w-25 text-warning">` + index++ +`</td>
                    <td class="w-50 text-warning">`+ element.username +`</td>
                    <td class="w-25 text-warning">` + element.totalHighscore + `</td>
                </tr>`;
            } else {
                content += `
                <tr>
                    <td class="w-25">` + index++ +`</td>
                    <td class="w-50">`+ element.username +`</td>
                    <td class="w-25">` + element.totalHighscore + `</td>
                </tr>`;
            }
            return true;
        });

        let pageHtml = `
<div class="row mx-0">
    <div class="col-0 col-md-2 col-lg-3"></div>
    <div class="mt-3 mt-sm-5 col-12 col-md-8 col-lg-6">
        <h1 class="text-center mb-3">Classements</h1>
        <h4>` +  rankMessage + `</h4>
        <table class="table table-dark text-center">
            <thead>
                <tr><th colspan="3"><h5>Meilleurs Scores Généraux</h5></th></tr>
            </thead>
            <tbody>`
            + content +
            `</tbody>
        </table>
    </div>
</div>`;
        page.innerHTML = pageHtml;
    });

}



export default RankingPage;
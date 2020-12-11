

let page = document.querySelector("#page");

const RankingPage = () => {
    loadScoreboard();
    page.innerHTML = "";
}

const loadScoreboard = async () => {
    await fetch("/api/users/totalscore").then(response => {
        if(!response.ok){
            throw new Error(response.status + " " + response.statusText);
        }
        return response.json();
    }).then( response =>{
        let pageHtml = `
<div class="side_page ranking container d-flex h-100">
    <table class="table table-dark" style="text-align: center;">
        <thead>
            <tr><th colspan="3"><h5>Meilleurs Scores Généraux</h5></th></tr>
        </thead>
        <tbody>`
        let index = 1;
        for(const ELEMENT of response.totalscore){
           pageHtml += `
            <tr>
                <td>` + index++ +`</td>
                <td>`+ ELEMENT.username +`</td>
                <td>` + ELEMENT.totalHighscore + `</td>
            </tr>`
        }
        `</tbody>
    </table>
</div>`;
        page.innerHTML = pageHtml;
    });

}

let pageHtml = `
<div class="side_page ranking container d-flex h-100">
    <table class="table table-dark" style="text-align: center;">
        <thead>
            <tr><th colspan="3"><h5>Meilleurs Scores Généraux</h5></th></tr>
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
</div>`;



export default RankingPage;
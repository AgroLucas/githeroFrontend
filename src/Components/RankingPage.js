

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
    <table class="table table-dark text-center">
        <thead>
            <tr><th colspan="3"><h5>Meilleurs Scores Généraux</h5></th></tr>
        </thead>
        <tbody>`
        let index = 1;
        response.totalscore.every(element => {
            if (index==50)
                return false;
            pageHtml += `
            <tr>
                <td>` + index++ +`</td>
                <td>`+ element.username +`</td>
                <td>` + element.totalHighscore + `</td>
            </tr>`;
            return true;
        });
        `</tbody>
    </table>
</div>`;
        page.innerHTML = pageHtml;
    });

}



export default RankingPage;
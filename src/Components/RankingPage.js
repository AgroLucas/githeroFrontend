let pageHtml = `
<p>Page des CLASSEMENTS</p>`;

let page = document.querySelector("#page");

const RankingPage = () => {
    page.innerHTML = pageHtml;
}

export default RankingPage;
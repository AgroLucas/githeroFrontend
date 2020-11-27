let pageHtml = `<p>Bonjour</p>`;

let page = document.querySelector("#page");

const HomePage = () => {
    page.innerHTML = pageHtml;
}

export default HomePage;
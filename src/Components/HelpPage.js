let pageHtml = `
<p>Page AIDE</p>`;

let page = document.querySelector("#page");

const HelpPage = () => {
    page.innerHTML = pageHtml;
}

export default HelpPage;
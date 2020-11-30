let pageHtml = `
<p>Page A PROPOS</p>`;

let page = document.querySelector("#page");

const AboutUsPage = () => {
    page.innerHTML = pageHtml;
}

export default AboutUsPage;
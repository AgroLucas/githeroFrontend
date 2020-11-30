let pageHtml = `
<p>Page des OPTIONS</p>`;

let page = document.querySelector("#page");

const OptionsPage = () => {
    page.innerHTML = pageHtml;
}

export default OptionsPage;
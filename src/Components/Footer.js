import { RedirectUrl } from "./Router.js";

let footerHtml = `
<div class="footer text-center">
    <button type="button" class="btn btn-secondary button_bottom" href="#" data-uri="/">A propos</button>
    <button type="button" class="btn btn-secondary button_bottom" href="#" data-uri="/">Aide</button>
    <button type="button" class="btn btn-secondary button_bottom" href="#" data-uri="/">Classements</button>
    <button type="button" class="btn btn-secondary button_bottom" href="#" data-uri="/">Options</button>
</div>`;

let footer = document.querySelector("#footer");

const Footer = () => {
    footer.innerHTML = footerHtml;
    footer.querySelectorAll("button").forEach(button=>{
        button.addEventListener("click",(e)=>{
            RedirectUrl(e.target.dataset.uri);
        })
    })
}

export default Footer;
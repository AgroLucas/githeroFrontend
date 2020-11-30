import { RedirectUrl } from "./Router.js";

let footerHtml = `
<div class="footer fixed-bottom text-center">
    <button type="button" class="btn btn-secondary button_bottom" href="#" data-uri="/aboutus">A propos</button>
    <button type="button" class="btn btn-secondary button_bottom" href="#" data-uri="/help">Aide</button>
    <button type="button" class="btn btn-secondary button_bottom" href="#" data-uri="/ranking">Classements</button>
    <button type="button" class="btn btn-secondary button_bottom" href="#" data-uri="/options">Options</button>
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
import { RedirectUrl } from "./Router.js";

let page = document.querySelector("#page");

let pageHtml = `Edit page (NOT IMPLEMENTED YET)`;

const EditPage = (data) => {
    if(!data){
        RedirectUrl("/addBeatmap");
    }else{
        page.innerHTML = pageHtml;
    }
}

export default EditPage;
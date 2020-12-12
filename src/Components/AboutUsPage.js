let pageHtml = `
<div class="text-center mt-3 mt-md-5 ml-4 mr-4 mb-3">
    <h1>A propos de nous</h1>
    <p>Nous sommes étudiants en 2ème année en Informatique de gestion à L'institut Paul Lambin.</p>
    <p>Nous avons dû créer ce site dans le cadre de notre cours de Javascript.</p>
    <p>Si vous avez des questions à propos du site en général ou du jeu, veuillez contacter l'un de nous par mail :</p>
    <p>Lucas Agrò : lucas.y.agro@student.vinci.be</p>
    <p>Anis Assaidi : anis.assaidi@student.vinci.be</p>
    <p>Bastien Boutte : bastien.boutte@student.vinci.be</p>
    <p>Baptiste Honnay : baptiste.honnay@student.vinci.be</p>    
    <p class ="mt-5">Note : notre logo est dérivé du logo de GIT de Jason Long.</p>

</div>`;

let page = document.querySelector("#page");

const AboutUsPage = () => {
    page.innerHTML = pageHtml;
}

export default AboutUsPage;
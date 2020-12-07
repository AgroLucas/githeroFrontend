let pageHtml = `
<div class="side_page text-center">
    <h1>Aide</h1>
    <div>
        <h2>Règles du jeu</h2>
        <p>Une fois la musique sélectionnée, vous arriverez sur la page du jeu.</br>
        Sur celle-ci, vous verrez 4 lignes qui sont reliées à vos touches D, F, J et K </br>
        (que vous aurez au préalable changé sur la page "Options").</p>
        <p>Des boutons vont commencer à apparaître et à défiler le long des lignes jusqu'à arriver à vos touches.</br>
        Le but du jeu est d'appuyer sur les touches correspondantes au moment ou le bouton est sur les touches.</p>
        <p>Au plus le bouton est proche des touches quand vous appuyez dessus, au plus vous gagnez de points.</br>
        Si vous êtes connecté, votre score final sera sauvegardé et vous pourrez le comparer à celui des autres </br>
        sur la page "Classements".</p>
    </div>
</div>`;

let page = document.querySelector("#page");

const HelpPage = () => {
    page.innerHTML = pageHtml;
}

export default HelpPage;
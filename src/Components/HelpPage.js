let pageHtml = `
<div class="side_page text-center">
    <h1>Aide</h1>
    <div>
        <h2>Règles du jeu</h2>
        <p>Une fois la musique sélectionnée, vous arriverez sur la page du jeu.</br>
        Sur celle-ci, vous verrez 4 lignes qui sont par défaut reliées à vos touches D, F, J et K </br>
        (les touches sont modifiables dans la page "Options").</p>
        <p>Des notes vont commencer à apparaître et à défiler le long des lignes jusqu'à arriver à vos touches.</br>
        Le but du jeu est d'appuyer sur les touches correspondantes au moment ou la note arrive sur une de vos touches.</p>
        <p>Une note appuyée lorsqu'elle atteint le milieu d'une de vos touches vous rapportent plus de points.</br>
        Il existe également des notes longues, quand elles atteignent une de vos touches restez appuyer pour gagner des points. </br>
        Si vous êtes connecté, votre score final sera sauvegardé et vous pourrez le comparer à celui des autres </br>
        sur la page "Classements".</p>
    </div>
</div>`;

let page = document.querySelector("#page");

const HelpPage = () => {
    page.innerHTML = pageHtml;
}

export default HelpPage;
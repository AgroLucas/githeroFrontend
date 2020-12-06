let pageHtml = `
<div class="row mt-3">
    <div class="col-md-3"></div>
    <div class="col-md-6">
        <h2>Options</h2>
        <form action="#">
            <div class="border mt-5 pl-3 pt-2">
                <h4>Volumes:</h4>
                <div class="form-group">
                    <label for="masterVolume">Principal:</label>
                    <input type="range" id="masterVolume" name="masterVolume" class="form-control-range w-25">
                </div>
                <div class="form-group">
                    <label for="bgmVolume">Musique:</label>
                    <input type="range" id="bgmVolume" name="bgmVolume" class="form-control-range w-25">
                </div>
                <div class="form-group">
                    <label for="effectVolume">Effets sonores:</label>
                    <input type="range" id="effectVolume" name="effectVolume" class="form-control-range w-25">
                </div>
            </div>
            <div class="border mt-5 pl-3 pt-2">
                <h4>Configuration des touches:</h4>
                <div class="row mt-3">
                    <div class="col-sm-2 pt-1">Bouton 1:</div>
                    <div class="col-sm-8"></div>
                    <div class="col-sm-1">
                        <button id="btnKey1" type="button" class="btn btn-outline-primary">D</button>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-sm-2 pt-1">Bouton 2:</div>
                    <div class="col-sm-8"></div>
                    <div class="col-sm-1">
                        <button id="btnKey2" type="button" class="btn btn-outline-primary">F</button>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-sm-2 pt-1">Bouton 3:</div>
                    <div class="col-sm-8"></div>
                    <div class="col-sm-1">
                        <button id="btnKey3" type="button" class="btn btn-outline-primary">J</button>
                    </div>
                </div>
                <div class="row my-3">
                    <div class="col-sm-2 pt-1">Bouton 4:</div>
                    <div class="col-sm-8"></div>
                    <div class="col-sm-1">
                        <button id="btnKey4" type="button" class="btn btn-outline-primary">K</button>
                    </div>
                </div>
            </div>
            <button id="submit" type="submit" class="mt-3 btn btn-primary">Enregistrer</button>
        </form>
    </div>
</div>`;

let page = document.querySelector("#page");

let currentPreferences = { //TODO: fetch from /api/users
    keyBinding: {
      key1: "d",
      key2: "f",
      key3: "j",
      key4: "k",
    },
    volume: {
      master: 1,
      bgm: 0.20,
      effect: 1,
    }
}

const defaultPreferences = {
    keyBinding: {
        key1: "d",
        key2: "f",
        key3: "j",
        key4: "k",
      },
      volume: {
        master: 1,
        bgm: 0.20,
        effect: 1,
      }
}

const OptionsPage = () => {
    page.innerHTML = pageHtml;

    let rangeMaster = document.querySelector("#btnKey1");

    let btnKey1 = document.querySelector("#btnKey1");
    btnKey1.innerText = currentPreferences.keyBinding.key1;

    let btnKey2 = document.querySelector("#btnKey2");
    btnKey2.innerText = currentPreferences.keyBinding.key2;

    let btnKey3 = document.querySelector("#btnKey3");
    btnKey3.innerText = currentPreferences.keyBinding.key3;

    let btnKey4 = document.querySelector("#btnKey4");
    btnKey4.innerText = currentPreferences.keyBinding.key4;
}

export default OptionsPage;
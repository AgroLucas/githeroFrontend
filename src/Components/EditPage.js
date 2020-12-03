let pageHtml = `
<div class="row">
    <div class="col-3"></div>
    <div class="col-6">
        <h2>Form Validation</h2>
        <p>In this example, we use <code>.was-validated</code> to indicate what's missing before submitting the form:</p>
        <form action="/action_page.php" class="was-validated">
        <div class="form-group">
            <label for="uname">Username:</label>
            <input type="text" class="form-control" id="uname" placeholder="Enter username" name="uname" required>
            <div class="invalid-feedback">Please fill out this field.</div>
        </div>
        <div class="form-group">
            <label for="pwd">Password:</label>
            <input type="password" class="form-control" id="pwd" placeholder="Enter password" name="pswd" required>
            <div class="invalid-feedback">Please fill out this field.</div>
        </div>
        <div class="form-group form-check">
            <label class="form-check-label">
            <input class="form-check-input" type="checkbox" name="remember" required> I agree on blabla.
            <div class="invalid-feedback">Check this checkbox to continue.</div>
            </label>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    </div>
</div>`;

let page = document.querySelector("#page");
 
const EditPage = () => {
    page.innerHTML = pageHtml;
}

export default EditPage;
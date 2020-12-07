"use strict"
import { RedirectUrl } from "./Router.js";
import Navbar from "./NavBar.js";
import {setUserSessionData} from "../utils/Session.js";

const registerPage=`
<form>
<div class="row">
    <div class="col-sm-3"></div>
    <div class="col-sm-6">
  <div class="form-group">
  <h1> Inscription : </h1>
  <br>
    <label for="email">Email</label>
    <input class="form-control" id="email" type="text" name="email" placeholder="Enter your email" required="" pattern="^\\w+([.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,4})+\$" />
  </div>
  <div class="form-group">
    <label for="password">Password</label>
    <input class="form-control" id="password" type="password" name="password" placeholder="Enter your password" required="" pattern=".*[A-Z]+.*" />
  </div>
  <button class="btn btn-primary" id="btn" type="submit">Submit</button>
  <!-- Create an alert component with bootstrap that is not displayed by default-->
  <div class="alert alert-danger mt-2 d-none" id="messageBoard"></div><span id="errorMessage"></span>
  </div>
</div>
  </form>`;

const RegisterPage = () => {
  let page = document.querySelector("#page");
  page.innerHTML = registerPage;
  let registerForm = document.querySelector("form");
  registerForm.addEventListener("submit", onRegister);
};

let onRegister = async (e) => {
  e.preventDefault();
  let user = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };
  try{
    let response = await fetch("/api/users/" , {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      body: JSON.stringify(user), // body data type must match "Content-Type" header
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response); // HTTP reponse
    if(!response.ok) 
    throw new Error("Error code : " + response.status + " , " + response.statusText);
    let jsonResponse = await response.json(); // return le body de la reponse parsed in JSON
    console.log("Response from server in JSON:", jsonResponse);
    setUserSessionData(jsonResponse);
    Navbar(jsonResponse); //refresh navbar for auth user
    RedirectUrl("/"); // renvoi home donc  ?!?!
  }catch (error) {
    let messageBoard = document.querySelector("#messageBoard");
    let errorMessage = "";
    if(errorMessage.includes("409")) errorMessage = "This user is already registered";
    else errorMessage = error.message;
    messageBoard.innerText=errorMessage;
    messageBoard.classList.add("d-block"); // montre le message grace au dblock de la classe boostrap
  }
    
}

export default RegisterPage;

"use strict"
import { RedirectUrl } from "./Router.js";
import { getUserSessionData } from "../utils/Session.js";
import Navbar from "./NavBar.js";

let page = document.querySelector("#page");

const UserListPage = () => {
  const user = getUserSessionData();
  if (!user) return RedirectUrl("/error", "Client. No UserSessionDate. Please login to create UserSessionData.");

  fetch("/api/users", {
    method: "GET",
    headers: {
      Authorization: user.token,
    }
  })
    .then((response) => {
      if (!response.ok) 
        throw new Error(
          "Error code :" + response.status + " : " + response.statusText
        );
        return response.json();
      })
     .then((data) => onUserList(data))
     .catch((err) => onError(err));
};

const onUserList = (data) => {
  let userListPage = `<h5>List of GitHero users</h5>
<ul class="list-group list-group-horizontal-lg">`;
  // Neat way to loop through all data in the array, create a new array of string elements (HTML li tags)
  // with map(), and create one string from the resulting array with join(''). '' means that the separator is a void string.
  userListPage += data.userList
    .map((user) => `<li class="list-group-item">${user.username}</li>`)
    .join("");
  userListPage += "</ul>";
  return (page.innerHTML = userListPage);
};

const onError = (err) => {
  console.error("UserListPage.onError:", err);
  let errorMessage;
  if (err.message) {
    if(err.message.includes("401")){
      errorMessage = "Client . Unauthorized access to this ressource : you must firt login.";
    }else {
      errorMessage = err.message;
    }
  }
  Navbar();
};

export default UserListPage;

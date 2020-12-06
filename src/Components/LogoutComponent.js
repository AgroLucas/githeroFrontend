import { RedirectUrl } from "./Router.js";
import Navbar from "./NavBar.js";
import {removeSessionData} from "../utils/Session.js";

const Logout = () => {
  removeSessionData();
  // re-render the navbar for a non-authenticated user
  Navbar();
  RedirectUrl("/login"); 
};


export default Logout;

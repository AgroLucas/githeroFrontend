import {Router} from "./Components/Router.js";
import stylesheet from "./stylesheet/style.css";
import Navbar from "./Components/Navbar.js";
import { setLayout } from "./utils/render.js";


setLayout()
Navbar();
Router();

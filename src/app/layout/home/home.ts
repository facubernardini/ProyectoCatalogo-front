import { Component } from '@angular/core';
import { Navbar } from "./navbar/navbar";
import { Hero } from "./hero/hero";
import { Footer } from "./footer/footer";
import { Features } from "./features/features";
import { Pricing } from "./pricing/pricing";
import { TiendasEjemplo } from "./tiendas-ejemplo/tiendas-ejemplo";
import { Faq } from "./faq/faq";
import { Login } from "../login/login";

@Component({
  selector: 'app-home',
  imports: [Navbar, Hero, Footer, Features, Pricing, TiendasEjemplo, Faq, Login],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
import { Component } from '@angular/core';
import { Navbar } from "./navbar/navbar";
import { Hero } from "./hero/hero";
import { Features } from "./features/features";
import { Pricing } from "./pricing/pricing";
import { TiendasEjemplo } from "./tiendas-ejemplo/tiendas-ejemplo";
import { Faq } from "./faq/faq";
import { Footer } from "./footer/footer";

@Component({
  selector: 'app-home',
  imports: [Navbar, Hero, Features, Pricing, TiendasEjemplo, Faq, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
import { Component, inject } from '@angular/core';
import { Navbar } from "./navbar/navbar";
import { Hero } from "./hero/hero";
import { Footer } from "./footer/footer";
import { Features } from "./features/features";
import { Pricing } from "./pricing/pricing";

@Component({
  selector: 'app-home',
  imports: [Navbar, Hero, Footer, Features, Pricing],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
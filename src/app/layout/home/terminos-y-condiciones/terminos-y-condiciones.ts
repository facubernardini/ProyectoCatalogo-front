import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Footer } from "../footer/footer";
import { Navbar } from "../navbar/navbar";

@Component({
  selector: 'app-terminos-y-condiciones',
  imports: [RouterLink, Footer, Navbar],
  templateUrl: './terminos-y-condiciones.html',
  styleUrl: './terminos-y-condiciones.css',
})
export class TerminosYCondiciones implements OnInit {
  ngOnInit() {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 50);
  }
}

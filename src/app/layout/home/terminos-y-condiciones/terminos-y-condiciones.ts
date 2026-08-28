import { Component, HostListener, OnInit, signal } from '@angular/core';
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
  showScrollButton = signal(false);
  
  ngOnInit() {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 50);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showScrollButton.set(window.scrollY > 400);
  }

  scrollToTop() {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth'
    });
  }
}

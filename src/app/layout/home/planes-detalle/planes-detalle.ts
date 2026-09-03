import { Component, OnInit } from '@angular/core';
import { Footer } from "../footer/footer";
import { Navbar } from "../navbar/navbar";
import { RouterLink } from '@angular/router';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-planes-detalle',
  imports: [RouterLink, Footer, Navbar, Icon],
  templateUrl: './planes-detalle.html',
  styleUrl: './planes-detalle.css',
})
export class PlanesDetalle implements OnInit {

  ngOnInit() {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 50);
  }
}
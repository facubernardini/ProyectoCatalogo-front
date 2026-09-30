import { Component, inject, OnInit } from '@angular/core';
import { Footer } from "../footer/footer";
import { Navbar } from "../navbar/navbar";
import { Icon } from "src/app/shared/components/icon";
import { Location } from '@angular/common';

@Component({
  selector: 'app-planes-detalle',
  imports: [Footer, Navbar, Icon],
  templateUrl: './planes-detalle.html',
  styleUrl: './planes-detalle.css',
})
export class PlanesDetalle implements OnInit {
  private location = inject(Location);
  
  ngOnInit() {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 50);
  }

  goBack() {
    this.location.back();
  }
}
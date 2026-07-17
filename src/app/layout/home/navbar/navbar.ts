import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
  private eRef = inject(ElementRef);
  
  isMenuOpen = false;
  isScrolled = false;

  opciones = [
    { nombre: 'Precios', ruta: '/' },
    { nombre: 'Funcionalidades', ruta: '/servicios' },
    { nombre: 'Contacto', ruta: '/contacto' },
    { nombre: 'Nuestras redes', ruta: '/' }
  ];

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;

    if (this.isMenuOpen) {
      this.cerrarMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.isMenuOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.cerrarMenu();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  cerrarMenu() {
    this.isMenuOpen = false;
  }

  irALogin() {
    this.cerrarMenu();
    this.router.navigate(['/login']);
  }

  irARegistro() {
    this.cerrarMenu();
    this.router.navigate(['/register']);
  }
}

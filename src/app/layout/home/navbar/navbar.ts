import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-navbar-landing',
  imports: [RouterLink, Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private router = inject(Router);
  private eRef = inject(ElementRef);

  brand = BRAND_DATA;
  
  isMenuOpen = false;
  isScrolled = false;
  isMounted = false;

  opciones = [
    { nombre: 'Funcionalidades', id: 'funcionalidades' },
    { nombre: 'Precios', id: 'precios' },
    { nombre: 'Tiendas de ejemplo', id: 'tiendas-ejemplo' },
    { nombre: 'Ayuda', id: 'faq' }
  ];

  ngOnInit() {
    this.isScrolled = window.scrollY > 20;

    setTimeout(() => {
      this.isMounted = true;
    }, 100);
  }

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

  scrollToSection(id: string) {
    this.cerrarMenu();

    const element = document.getElementById(id);
    
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  }
}

import { AfterViewInit, Component, ElementRef, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-navbar-landing',
  imports: [Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private eRef = inject(ElementRef);

  brand = BRAND_DATA;
  
  isMenuOpen = false;
  isScrolled = false;
  isMounted = false;

  activeSection: string = 'inicio';

  private observer: IntersectionObserver | null = null;

  opciones = [
    { nombre: 'Inicio', id: 'inicio' },
    { nombre: 'Funcionalidades', id: 'funcionalidades' },
    { nombre: 'Tiendas de ejemplo', id: 'tiendas-ejemplo' },
    { nombre: 'Precios', id: 'precios' },
    { nombre: 'Ayuda', id: 'faq' }
  ];

  ngOnInit() {
    this.isScrolled = window.scrollY > 20;

    setTimeout(() => {
      this.isMounted = true;
    }, 100);
  }

  ngAfterViewInit() {
    const options = {
      root: null,
      rootMargin: '-40% 0px -60% 0px', 
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeSection = entry.target.id;
        }
      });
    }, options);

    this.opciones.forEach(opcion => {
      const element = document.getElementById(opcion.id);
      if (element) {
        this.observer?.observe(element);
      }
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
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

  get isHome(): boolean {
    const urlActual = this.router.url.split('?')[0].split('#')[0];
    return urlActual === '/' || urlActual === '';
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
    this.activeSection = id;
    this.cerrarMenu();

    const urlActual = this.router.url.split('?')[0].split('#')[0];
    
    if (urlActual === '/' || urlActual === '') {
      this.ejecutarScrollSmooth(id);
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          this.ejecutarScrollSmooth(id);
        }, 100);
      });
    }
  }

  private ejecutarScrollSmooth(id: string) {
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

import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BRAND_DATA } from 'src/app/core/data/brand.data';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-footer-landing',
  imports: [RouterLink, Icon],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private router = inject(Router);

  public BRAND_DATA = BRAND_DATA;
  public currentYear = new Date().getFullYear();

  irARegistro() {
    this.router.navigate(['/register']);
  }

  scrollToSection(id: string) {
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

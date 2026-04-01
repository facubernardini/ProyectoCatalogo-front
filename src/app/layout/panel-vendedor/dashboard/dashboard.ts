import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from "@shared/components/icon";
import { Catalogo } from 'src/app/core/models/catalogo.model';
import { Vendedor } from 'src/app/core/models/vendedor.model';

@Component({
  selector: 'app-dashboard',
  imports: [Icon, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  vendedor!: Vendedor;
  catalogo!: Catalogo;

  ngOnInit() {
    const data = localStorage.getItem('vendedor');
    if (data) {
      this.vendedor = JSON.parse(data);
      if (this.vendedor.catalogo){
        this.catalogo = this.vendedor.catalogo;
      }
    }
  }
  
  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('vendedor');
    window.location.href = '/login';
  }
}

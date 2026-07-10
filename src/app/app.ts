import { Component, DOCUMENT, inject, OnInit, Renderer2, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from 'src/environments/environment.dev';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('proyecto-catalogo');

  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  ngOnInit(): void {
    if (environment.production) {
      this.inyectarScriptAnalytics();
    }
  }

  private inyectarScriptAnalytics(): void {
    const trackingId = environment.analyticsId; 

    const scriptLibreria = this.renderer.createElement('script');
    this.renderer.setAttribute(scriptLibreria, 'async', 'true');
    this.renderer.setAttribute(scriptLibreria, 'src', `https://www.googletagmanager.com/gtag/js?id=${trackingId}`);
    this.renderer.appendChild(this.document.head, scriptLibreria);

    const scriptConfig = this.renderer.createElement('script');
    const codigoConfig = this.renderer.createText(`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId}');
    `);
    this.renderer.appendChild(scriptConfig, codigoConfig);
    this.renderer.appendChild(this.document.head, scriptConfig);
  }
}

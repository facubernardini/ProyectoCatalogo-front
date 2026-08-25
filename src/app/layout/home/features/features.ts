import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Icon } from "src/app/shared/components/icon";

@Component({
  selector: 'app-features',
  imports: [Icon],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features implements AfterViewInit, OnDestroy {
  cuponesAnimados = false;
  private cuponObserver: IntersectionObserver | null = null;
  
  @ViewChild('cuponesContainer') cuponesContainer!: ElementRef;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.cuponObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && window.innerWidth < 768) {
        this.cuponesAnimados = true;
        this.cdr.detectChanges();
        this.cuponObserver?.disconnect();
      }
    }, { 
      threshold: 1.0 
    });

    if (this.cuponesContainer) {
      this.cuponObserver.observe(this.cuponesContainer.nativeElement);
    }
  }

  ngOnDestroy() {
    this.cuponObserver?.disconnect();
  }
}

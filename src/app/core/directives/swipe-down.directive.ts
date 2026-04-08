import { Directive, ElementRef, EventEmitter, Output, HostListener, Renderer2 } from '@angular/core';

@Directive({
	selector: '[appSwipeDown]',
	standalone: true
})
export class SwipeDownDirective {
	@Output() onSwipe = new EventEmitter<void>();
	
	private startY = 0;
	private currentY = 0;
	private threshold = 150;
	private isAtTop = false;

	constructor(private el: ElementRef, private renderer: Renderer2) {}

	@HostListener('touchstart', ['$event'])
	onTouchStart(event: TouchEvent) {
		const scrollContainer = this.el.nativeElement.querySelector('.overflow-y-auto');
		// Guardamos si empezamos el toque estando en el tope
		this.isAtTop = scrollContainer ? scrollContainer.scrollTop === 0 : true;
		
		this.startY = event.touches[0].clientY;
		this.renderer.setStyle(this.el.nativeElement, 'transition', 'none');
	}

	@HostListener('touchmove', ['$event'])
	onTouchMove(event: TouchEvent) {
		if (!this.isAtTop) return;

		const scrollContainer = this.el.nativeElement.querySelector('.overflow-y-auto');
		
		if (scrollContainer && scrollContainer.scrollTop > 0) {
			return;
		}

		this.currentY = event.touches[0].clientY;
		const deltaY = this.currentY - this.startY;

		if (deltaY > 0) {
			if (event.cancelable) event.preventDefault();
			this.renderer.setStyle(this.el.nativeElement, 'transform', `translateY(${deltaY}px)`);
		}
	}

	@HostListener('touchend')
	onTouchEnd() {
		const deltaY = this.currentY - this.startY;

		this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)');

		if (deltaY > this.threshold) {
			this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(100%)');
			setTimeout(() => this.onSwipe.emit(), 200);
		} else {
			this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(0)');
		}
		
		this.startY = 0;
		this.currentY = 0;
	}
}
import { Component, HostListener, inject } from '@angular/core';
import { ImageViewerService } from '../../services/image-viewer.service';
import { Icon } from "../../components/icon";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-viewer',
  imports: [CommonModule, Icon],
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.css',
})
export class ImageViewer {
  public viewerService = inject(ImageViewerService);

  @HostListener('window:keydown.escape')
  onEscape() {
    if (this.viewerService.isOpen()) {
      this.viewerService.close();
    }
  }
}

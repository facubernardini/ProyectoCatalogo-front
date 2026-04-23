import { CommonModule } from "@angular/common";
import { Component, EventEmitter, input, Input, output, Output, signal } from "@angular/core";
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-config-section',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './config-section.html',
  styleUrl: './config-section.css',
})
export class ConfigSection {
  title = input.required<string>();
  icon = input<string>('settings');
  loading = input<boolean>(false);
  
  onSave = output<void>();
  onCancel = output<void>();
  
  editando = signal(false);

  toggleEdit() {
    if (this.editando()) {
      this.onSave.emit();
    } else {
      this.editando.set(true);
    }
  }

  cancel() {
    this.onCancel.emit();
    this.editando.set(false);
  }

  forceClose() {
    this.editando.set(false);
  }
}
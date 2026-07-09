import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '@shared/components/icon';

@Component({
  selector: 'app-menu-inferior-bo',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './menu-inferior-bo.html',
})
export class MenuInferiorBO {}
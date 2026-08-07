import { Component } from '@angular/core';
import { EnConstruccion } from "./en-construccion/en-construccion";

@Component({
  selector: 'app-home',
  imports: [EnConstruccion],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
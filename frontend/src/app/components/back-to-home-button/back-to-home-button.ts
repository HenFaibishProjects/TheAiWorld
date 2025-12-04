import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-to-home-button',
  standalone: true,
  templateUrl: './back-to-home-button.html',
  styleUrls: ['./back-to-home-button.css']
})
export class BackToHomeButtonComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/ai-menu']);
  }
}

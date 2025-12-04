import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackToHomeButtonComponent } from './components/back-to-home-button/back-to-home-button';
import { Nav } from './nav/nav';
import { LoginComponent } from './login/login';
import { Router } from '@angular/router';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, BackToHomeButtonComponent, Nav, LoginComponent],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	constructor(public router: Router) {}
	title = 'WorkWithTokens';

	get hideNav() {
    return this.router.url === '/' || this.router.url === '/login';
  }
}

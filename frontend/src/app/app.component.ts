import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackToHomeButtonComponent } from './components/back-to-home-button/back-to-home-button';
import { Nav } from './nav/nav';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, BackToHomeButtonComponent, Nav],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'WorkWithTokens';
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { McpListComponent } from './components/mcp-list/mcp-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, McpListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Claude MCP Manager';
}

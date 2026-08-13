import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auditoria } from '../../../models/auditoria.model';

@Component({
  selector: 'app-auditoria-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auditoria-view.component.html',
  styleUrls: ['./auditoria-view.component.css']
})
export class AuditoriaViewComponent {
  @Input() auditoria: Auditoria[] = [];
}

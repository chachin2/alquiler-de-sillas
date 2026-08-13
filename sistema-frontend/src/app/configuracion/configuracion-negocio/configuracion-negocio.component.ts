import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfiguracionNegocioService } from '../configuracion-negocio.service';
import { CommonModule } from '@angular/common';
import { IndexedDbService } from '../../services/indexeddb.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-configuracion-negocio',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './configuracion-negocio.component.html',
  styleUrl: './configuracion-negocio.component.css'
})
export class ConfiguracionNegocioComponent implements OnInit {
  form: FormGroup;
  newUserForm: FormGroup;
  changePasswordForm: FormGroup;
  logoPreview: string = '';
  usuarios: User[] = [];
  vistaActual: 'negocio' | 'usuarios' = 'negocio';
  usuarioAEditar: User | null = null;
  mensaje = { texto: '', tipo: '' };

  constructor(
    private fb: FormBuilder, 
    private configService: ConfiguracionNegocioService,
    private dbService: IndexedDbService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      nombre: [''],
      direccion: [''],
      logo: ['assets/logo.jpg']
    });

    this.newUserForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
      mod_dashboard: [true],
      mod_inventario: [true],
      mod_gestiones: [true],
      mod_edicion: [true],
      mod_configuracion: [false],
      mod_auditoria: [false]
    });

    this.changePasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit() {
    this.configService.currentConfig.subscribe(config => {
      this.form.patchValue(config);
      this.logoPreview = config.logo;
    });
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.dbService.obtenerUsuarios().subscribe(users => {
      this.usuarios = users;
    });
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = { texto, tipo };
    setTimeout(() => this.mensaje = { texto: '', tipo: '' }, 4000);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
        this.form.patchValue({ logo: this.logoPreview });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.configService.updateConfig(this.form.value.nombre, this.form.value.direccion, this.form.value.logo);
    this.mostrarMensaje('Configuración guardada correctamente', 'success');
  }

  async crearUsuario() {
    if (this.newUserForm.invalid) return;

    try {
      const formVal = this.newUserForm.value;
      const hash = await this.authService.hashPassword(formVal.password);
      
      const modulosPermitidos: string[] = [];
      if (formVal.mod_dashboard) modulosPermitidos.push('dashboard');
      if (formVal.mod_inventario) modulosPermitidos.push('inventario');
      if (formVal.mod_gestiones) modulosPermitidos.push('gestiones');
      if (formVal.mod_edicion) modulosPermitidos.push('edicion');
      if (formVal.mod_configuracion) modulosPermitidos.push('configuracion');
      if (formVal.mod_auditoria) modulosPermitidos.push('auditoria');

      this.dbService.registrarUsuario({ 
        username: formVal.username, 
        passwordHash: hash,
        modulos: modulosPermitidos
      }).subscribe({
        next: () => {
          this.mostrarMensaje('Usuario creado exitosamente', 'success');
          this.newUserForm.reset({
            mod_dashboard: true, mod_inventario: true, mod_gestiones: true,
            mod_edicion: true, mod_configuracion: false, mod_auditoria: false
          });
          this.cargarUsuarios();
        },
        error: (err) => this.mostrarMensaje(err.message, 'error')
      });
    } catch (error) {
      this.mostrarMensaje('Error al crear usuario', 'error');
    }
  }

  iniciarCambioPassword(user: User) {
    this.usuarioAEditar = user;
    this.changePasswordForm.reset();
  }

  cancelarCambioPassword() {
    this.usuarioAEditar = null;
    this.changePasswordForm.reset();
  }

  async confirmarCambioPassword() {
    if (!this.usuarioAEditar || this.changePasswordForm.invalid) return;

    try {
      const { password } = this.changePasswordForm.value;
      const hash = await this.authService.hashPassword(password);
      
      const updatedUser = { ...this.usuarioAEditar, passwordHash: hash };
      
      this.dbService.actualizarUsuario(updatedUser).subscribe({
        next: () => {
          this.mostrarMensaje(`Contraseña de ${updatedUser.username} actualizada`, 'success');
          this.cancelarCambioPassword();
          this.cargarUsuarios();
        },
        error: (err) => this.mostrarMensaje('Error al cambiar contraseña', 'error')
      });
    } catch (error) {
      this.mostrarMensaje('Error al cambiar contraseña', 'error');
    }
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.dbService.eliminarUsuario(id).subscribe(() => {
        this.mostrarMensaje('Usuario eliminado', 'success');
        this.cargarUsuarios();
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}

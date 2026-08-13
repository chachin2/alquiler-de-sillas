package com.example.alquiler.controller;

import com.example.alquiler.model.Alquiler;
import com.example.alquiler.model.Articulo;
import com.example.alquiler.service.SistemaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sistema")
@CrossOrigin(origins = "*")
public class InventarioAlquilerController {

    private final SistemaService service;

    public InventarioAlquilerController(SistemaService service) {
        this.service = service;
    }

    @GetMapping("/inventario")
    public List<Articulo> obtenerInventario() {
        return service.obtenerInventario();
    }

    @PostMapping("/inventario")
    public Articulo registrarArticulo(@RequestBody Articulo nuevo) {
        return service.registrarArticulo(nuevo);
    }

    @GetMapping("/agenda")
    public List<Alquiler> obtenerAgenda() {
        return service.obtenerAgenda();
    }

    @PostMapping("/alquiler")
    public Map<String, String> registrarAlquiler(@RequestBody Alquiler nuevoAlquiler) {
        return service.registrarAlquiler(nuevoAlquiler);
    }
}

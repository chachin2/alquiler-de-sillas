package com.example.alquiler.service;

import com.example.alquiler.model.Alquiler;
import com.example.alquiler.model.Articulo;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SistemaService {

    private final List<Articulo> inventario = new ArrayList<>();
    private final List<Alquiler> agenda = new ArrayList<>();
    private long idArticuloSecuencia = 1;
    private long idAlquilerSecuencia = 1;

    @PostConstruct
    public void init() {
        inventario.add(new Articulo(idArticuloSecuencia++, "Sillas Plásticas", 50, 5.0, "DIA"));
        inventario.add(new Articulo(idArticuloSecuencia++, "Mesas Tablón", 10, 25.0, "DIA"));
        inventario.add(new Articulo(idArticuloSecuencia++, "Manteles Blancos", 15, 10.0, "DIA"));
        agenda.add(new Alquiler(idAlquilerSecuencia++, 1L, "Carlos Gómez", 10,
                LocalDate.now().plusDays(2), LocalDate.now().plusDays(5), "RESERVADO"));
    }

    public List<Articulo> obtenerInventario() {
        return inventario;
    }

    public Articulo registrarArticulo(Articulo nuevo) {
        nuevo.setId(idArticuloSecuencia++);
        inventario.add(nuevo);
        return nuevo;
    }

    public List<Alquiler> obtenerAgenda() {
        return agenda;
    }

    public Map<String, String> registrarAlquiler(Alquiler nuevoAlquiler) {
        Map<String, String> respuesta = new HashMap<>();
        Articulo art = inventario.stream()
                .filter(a -> a.getId().equals(nuevoAlquiler.getArticuloId()))
                .findFirst()
                .orElse(null);

        if (art == null) {
            respuesta.put("error", "El artículo seleccionado no existe.");
            return respuesta;
        }

        int comprometidos = agenda.stream()
                .filter(alq -> alq.getArticuloId().equals(nuevoAlquiler.getArticuloId()))
                .filter(alq -> !alq.getEstado().equals("DEVUELTO"))
                .filter(alq -> !(nuevoAlquiler.getFechaVencimiento().isBefore(alq.getFechaInicio())
                        || nuevoAlquiler.getFechaInicio().isAfter(alq.getFechaVencimiento())))
                .mapToInt(Alquiler::getCantidadAlquilada)
                .sum();

        int disponibleReal = art.getCantidadTotal() - comprometidos;

        if (nuevoAlquiler.getCantidadAlquilada() > disponibleReal) {
            respuesta.put("error", "Inventario insuficiente. Solo quedan " + disponibleReal
                    + " unidades disponibles para estas fechas.");
            return respuesta;
        }

        nuevoAlquiler.setId(idAlquilerSecuencia++);
        agenda.add(nuevoAlquiler);
        respuesta.put("success", "Alquiler registrado exitosamente.");
        return respuesta;
    }
}

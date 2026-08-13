package com.example.alquiler.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

public class Alquiler {
    private Long id;
    private Long articuloId;
    private String cliente;
    private int cantidadAlquilada;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaInicio;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaVencimiento;
    private String estado;

    public Alquiler() {}

    public Alquiler(Long id, Long articuloId, String cliente, int cantidadAlquilada,
                    LocalDate fechaInicio, LocalDate fechaVencimiento, String estado) {
        this.id = id;
        this.articuloId = articuloId;
        this.cliente = cliente;
        this.cantidadAlquilada = cantidadAlquilada;
        this.fechaInicio = fechaInicio;
        this.fechaVencimiento = fechaVencimiento;
        this.estado = estado;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getArticuloId() { return articuloId; }
    public void setArticuloId(Long articuloId) { this.articuloId = articuloId; }
    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }
    public int getCantidadAlquilada() { return cantidadAlquilada; }
    public void setCantidadAlquilada(int cantidadAlquilada) { this.cantidadAlquilada = cantidadAlquilada; }
    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}

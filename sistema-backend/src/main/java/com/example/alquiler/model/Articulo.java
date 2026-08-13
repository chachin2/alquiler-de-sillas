package com.example.alquiler.model;

public class Articulo {
    private Long id;
    private String nombre;
    private int cantidadTotal;
    private double tarifa;
    private String tipoTarifa;

    public Articulo() {}

    public Articulo(Long id, String nombre, int cantidadTotal, double tarifa, String tipoTarifa) {
        this.id = id;
        this.nombre = nombre;
        this.cantidadTotal = cantidadTotal;
        this.tarifa = tarifa;
        this.tipoTarifa = tipoTarifa;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public int getCantidadTotal() { return cantidadTotal; }
    public void setCantidadTotal(int cantidadTotal) { this.cantidadTotal = cantidadTotal; }
    public double getTarifa() { return tarifa; }
    public void setTarifa(double tarifa) { this.tarifa = tarifa; }
    public String getTipoTarifa() { return tipoTarifa; }
    public void setTipoTarifa(String tipoTarifa) { this.tipoTarifa = tipoTarifa; }
}

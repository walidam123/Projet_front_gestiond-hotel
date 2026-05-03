package com.hotel.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_number")
    private String roomNumber;
    
    private String category;
    
    @Column(name = "price_per_night")
    private BigDecimal pricePerNight;
    
    private String status = "LIBRE";
    private Integer floor;
    private String description;
}

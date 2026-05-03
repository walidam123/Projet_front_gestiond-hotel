package com.hotel.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_id")
    private Long reservationId;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "tva_rate")
    private BigDecimal tvaRate = new BigDecimal("20.0");

    @Column(name = "deposit_deducted")
    private BigDecimal depositDeducted = BigDecimal.ZERO;

    @Column(name = "net_to_pay")
    private BigDecimal netToPay;

    private String status = "EN_ATTENTE";

    @Column(name = "issued_at")
    private LocalDateTime issuedAt = LocalDateTime.now();

    @Column(name = "closed_at")
    private LocalDateTime closedAt;
}

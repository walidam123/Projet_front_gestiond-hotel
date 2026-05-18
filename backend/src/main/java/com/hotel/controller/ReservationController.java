package com.hotel.controller;

import com.hotel.entity.Reservation;
import com.hotel.repository.ReservationRepository;
import com.hotel.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;

    @GetMapping
    public ResponseEntity<List<Reservation>> getAll() {
        return ResponseEntity.ok(reservationRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getById(@PathVariable Long id) {
        return reservationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Vérifier disponibilité d'une chambre
    @GetMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam Long roomId,
            @RequestParam String checkIn,
            @RequestParam String checkOut) {

        LocalDate checkInDate = LocalDate.parse(checkIn);
        LocalDate checkOutDate = LocalDate.parse(checkOut);

        if (!checkInDate.isBefore(checkOutDate)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("available", false,
                            "message", "La date de départ doit être après la date d'arrivée"));
        }

        boolean overlap = reservationRepository.existsOverlappingReservation(
                roomId, checkInDate, checkOutDate);

        if (overlap) {
            return ResponseEntity.ok(Map.of(
                    "available", false,
                    "message",
                    "Cette chambre est déjà réservée pour ces dates. Veuillez choisir une autre date ou une autre chambre."));
        }

        return ResponseEntity.ok(Map.of("available", true, "message", "Chambre disponible"));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Reservation reservation) {
        // 1. Vérifier disponibilité
        if (reservation.getRoom() != null && reservation.getCheckIn() != null
                && reservation.getCheckOut() != null) {

            boolean overlap = reservationRepository.existsOverlappingReservation(
                    reservation.getRoom().getId(),
                    reservation.getCheckIn(),
                    reservation.getCheckOut());

            if (overlap) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "ROOM_NOT_AVAILABLE",
                        "message",
                        "Cette chambre est déjà réservée pour ces dates. Veuillez choisir une autre date ou une autre chambre disponible."));
            }
        }

        // 2. Créer la réservation
        reservation.setStatus("CONFIRMEE");
        Reservation saved = reservationRepository.save(reservation);

        // 3. Mettre à jour le statut de la chambre → OCCUPEE
        if (saved.getRoom() != null) {
            roomRepository.updateStatus(saved.getRoom().getId(), "OCCUPEE");
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reservation> update(
            @PathVariable Long id, @RequestBody Reservation updated) {
        return reservationRepository.findById(id).map(r -> {
            r.setCheckIn(updated.getCheckIn());
            r.setCheckOut(updated.getCheckOut());
            r.setStatus(updated.getStatus());
            r.setDeposit(updated.getDeposit());

            // Mettre à jour statut chambre selon statut réservation
            if ("TERMINEE".equals(updated.getStatus()) || "ANNULEE".equals(updated.getStatus())) {
                if (r.getRoom() != null) {
                    roomRepository.updateStatus(r.getRoom().getId(), "LIBRE");
                }
            }

            return ResponseEntity.ok(reservationRepository.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reservationRepository.findById(id).ifPresent(r -> {
            // Libérer la chambre à l'annulation
            if (r.getRoom() != null) {
                roomRepository.updateStatus(r.getRoom().getId(), "LIBRE");
            }
        });
        reservationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
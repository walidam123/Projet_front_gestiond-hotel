package com.hotel.repository;

import com.hotel.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Vérifie si une chambre est déjà réservée pour des dates qui se chevauchent
    @Query("""
                SELECT COUNT(r) > 0 FROM Reservation r
                WHERE r.room.id = :roomId
                AND r.status NOT IN ('ANNULEE')
                AND r.checkIn < :checkOut
                AND r.checkOut > :checkIn
            """)
    boolean existsOverlappingReservation(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);

    // Trouve les réservations qui commencent aujourd'hui
    @Query("SELECT r FROM Reservation r WHERE r.checkIn = :today AND r.status = 'CONFIRMEE'")
    List<Reservation> findCheckInsToday(@Param("today") LocalDate today);

    // Trouve les réservations qui se terminent aujourd'hui
    @Query("SELECT r FROM Reservation r WHERE r.checkOut = :today AND r.status = 'EN_COURS'")
    List<Reservation> findCheckOutsToday(@Param("today") LocalDate today);
}
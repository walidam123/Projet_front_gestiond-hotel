package com.hotel.controller;

import com.hotel.entity.Invoice;
import com.hotel.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import java.io.ByteArrayOutputStream;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;

    @GetMapping
    public ResponseEntity<List<Invoice>> getAll() {
        return ResponseEntity.ok(invoiceRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getById(@PathVariable Long id) {
        return invoiceRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<?> closeInvoice(@PathVariable Long id) {
        return invoiceRepository.findById(id).map(invoice -> {
            if ("CLOTUREE".equals(invoice.getStatus())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Facture déjà clôturée"));
            }
            if (invoice.getNetToPay() != null && 
                invoice.getNetToPay().doubleValue() > 0) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", 
                        "Impossible de clôturer : solde de " + 
                        invoice.getNetToPay() + " MAD reste à payer"));
            }
            invoice.setStatus("CLOTUREE");
            invoice.setClosedAt(LocalDateTime.now());
            return ResponseEntity.ok(invoiceRepository.save(invoice));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> generatePdf(@PathVariable Long id) {
        return invoiceRepository.findById(id).map(invoice -> {
            try {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf);

                document.add(new Paragraph("FACTURE HOTEL").setBold().setFontSize(20));
                document.add(new Paragraph("Facture N° " + invoice.getId()));
                document.add(new Paragraph("Date : " + invoice.getIssuedAt()));
                document.add(new Paragraph("--------------------------------------------------"));
                document.add(new Paragraph("Réservation N° : " + invoice.getReservationId()));
                document.add(new Paragraph("Montant Total : " + invoice.getTotalAmount() + " MAD"));
                document.add(new Paragraph("TVA : " + invoice.getTvaRate() + " %"));
                document.add(new Paragraph("Acompte Déduit : " + invoice.getDepositDeducted() + " MAD"));
                document.add(new Paragraph("Net à Payer : " + invoice.getNetToPay() + " MAD").setBold());
                document.add(new Paragraph("Statut : " + invoice.getStatus()));

                document.close();

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDispositionFormData("attachment", "facture_" + invoice.getId() + ".pdf");

                return ResponseEntity.ok()
                        .headers(headers)
                        .body(baos.toByteArray());
            } catch (Exception e) {
                return ResponseEntity.internalServerError().<byte[]>build();
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}

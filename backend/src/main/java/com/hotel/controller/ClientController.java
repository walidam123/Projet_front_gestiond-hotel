package com.hotel.controller;

import com.hotel.entity.Client;
import com.hotel.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientRepository clientRepository;

    @GetMapping
    public ResponseEntity<List<Client>> getAll() {
        return ResponseEntity.ok(clientRepository.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Client>> search(@RequestParam String query) {
        return ResponseEntity.ok(
            clientRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query)
        );
    }

    @PostMapping
    public ResponseEntity<Client> create(@RequestBody Client client) {
        return ResponseEntity.ok(clientRepository.save(client));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> update(@PathVariable Long id, @RequestBody Client updated) {
        return clientRepository.findById(id).map(client -> {
            client.setFirstName(updated.getFirstName());
            client.setLastName(updated.getLastName());
            client.setEmail(updated.getEmail());
            client.setPhone(updated.getPhone());
            client.setIdDocument(updated.getIdDocument());
            client.setNationality(updated.getNationality());
            return ResponseEntity.ok(clientRepository.save(client));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

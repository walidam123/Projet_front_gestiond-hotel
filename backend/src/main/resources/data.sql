-- Compte Admin par défaut (mot de passe : Admin123)
INSERT INTO users (name, email, username, password, role)
VALUES ('Administrateur', 'admin@hotel.com', 'admin',
        '$2a$10$fD4LoqMYZa.YAl11jRCcYehJyr.w6Q5d/qslFyVirew8Dez/Z4KNu',
        'ROLE_ADMIN')
ON CONFLICT (username) DO NOTHING;

-- Compte Réceptionniste (mot de passe : Reception1)
INSERT INTO users (name, email, username, password, role)
VALUES ('Sara Benali', 'sara@hotel.com', 'sara',
        '$2a$10$ixLUHQCxqneDFZqkKZoV6edA2zXqESpZwt7kpeh8ZHSwSOgeWn552',
        'ROLE_RECEPTIONNISTE')
ON CONFLICT (username) DO NOTHING;

-- Chambres initiales
INSERT INTO rooms (room_number, category, price_per_night, floor, status) VALUES
('101', 'SIMPLE', 500.00,  1, 'LIBRE'),
('102', 'SIMPLE', 500.00,  1, 'LIBRE'),
('201', 'DOUBLE', 800.00,  2, 'LIBRE'),
('202', 'DOUBLE', 800.00,  2, 'OCCUPEE'),
('301', 'SUITE',  1500.00, 3, 'LIBRE'),
('302', 'SUITE',  1500.00, 3, 'EN_NETTOYAGE')
ON CONFLICT (room_number) DO NOTHING;

-- Services initiaux
INSERT INTO services (label, unit_price) VALUES
('Petit-déjeuner',    80.00),
('Spa & Hammam',     200.00),
('Transfert aéroport',150.00),
('Room Service',      120.00)
ON CONFLICT DO NOTHING;

package com.hotel.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateJwtToken(Authentication authentication) {
        String username = authentication.getName();
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                   .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(authToken); // ← parseClaimsJws et non parse
            return true;
        } catch (ExpiredJwtException e) {
            System.err.println("JWT expiré : " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("JWT non supporté : " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.err.println("JWT malformé : " + e.getMessage());
        } catch (SignatureException e) {
            System.err.println("Signature JWT invalide : " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT vide : " + e.getMessage());
        }
        return false;
    }
}

package com.agencia.backoffice.lead;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String company;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadChallenge challenge;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Lead() {
    }

    private Lead(String fullName, String email, String company, LeadChallenge challenge) {
        this.fullName = fullName;
        this.email = email;
        this.company = company;
        this.challenge = challenge;
    }

    public static Lead create(String fullName, String email, String company, LeadChallenge challenge) {
        return new Lead(fullName, email, company, challenge);
    }

    public UUID getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getCompany() {
        return company;
    }

    public LeadChallenge getChallenge() {
        return challenge;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

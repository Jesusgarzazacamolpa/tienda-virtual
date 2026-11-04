package com.agencia.backoffice.lead;

import com.agencia.backoffice.common.text.Emails;
import com.agencia.backoffice.lead.dto.CreateLeadRequest;
import com.agencia.backoffice.lead.dto.LeadResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class LeadService {

    private final LeadRepository leadRepository;

    public LeadService(LeadRepository leadRepository) {
        this.leadRepository = leadRepository;
    }

    @Transactional
    public Optional<LeadResponse> create(CreateLeadRequest request) {
        if (request.website() != null && !request.website().isBlank()) {
            return Optional.empty();
        }

        Lead lead = Lead.create(
                request.fullName().trim(),
                Emails.normalize(request.email()),
                request.company().trim(),
                request.challenge());

        Lead saved = leadRepository.saveAndFlush(lead);
        return Optional.of(new LeadResponse(saved.getId(), saved.getCreatedAt()));
    }
}

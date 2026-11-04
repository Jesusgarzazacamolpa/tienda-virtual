package com.agencia.backoffice.lead;

import com.agencia.backoffice.lead.dto.CreateLeadRequest;
import com.agencia.backoffice.lead.dto.LeadResponse;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LeadServiceTest {

    private final LeadRepository leadRepository = mock(LeadRepository.class);
    private final LeadService leadService = new LeadService(leadRepository);

    @Test
    void normalizesAndPersistsLead() {
        when(leadRepository.saveAndFlush(any(Lead.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<LeadResponse> response = leadService.create(new CreateLeadRequest(
                "  Ana López  ", "  ANA@Empresa.COM ", "  Corporativo del Bajío ",
                LeadChallenge.MODERNIZATION, ""));

        assertThat(response).isPresent();

        ArgumentCaptor<Lead> captor = ArgumentCaptor.forClass(Lead.class);
        verify(leadRepository).saveAndFlush(captor.capture());
        Lead saved = captor.getValue();
        assertThat(saved.getFullName()).isEqualTo("Ana López");
        assertThat(saved.getEmail()).isEqualTo("ana@empresa.com");
        assertThat(saved.getCompany()).isEqualTo("Corporativo del Bajío");
        assertThat(saved.getChallenge()).isEqualTo(LeadChallenge.MODERNIZATION);
    }

    @Test
    void acceptsMissingHoneypot() {
        when(leadRepository.saveAndFlush(any(Lead.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<LeadResponse> response = leadService.create(new CreateLeadRequest(
                "Ana", "ana@empresa.com", "Empresa", LeadChallenge.INTEGRATIONS, null));

        assertThat(response).isPresent();
        verify(leadRepository).saveAndFlush(any(Lead.class));
    }

    @Test
    void ignoresSubmissionWhenHoneypotIsFilled() {
        Optional<LeadResponse> response = leadService.create(new CreateLeadRequest(
                "Bot", "bot@spam.com", "Spam", LeadChallenge.INTEGRATIONS, "http://spam.example"));

        assertThat(response).isEmpty();
        verify(leadRepository, never()).saveAndFlush(any(Lead.class));
    }
}

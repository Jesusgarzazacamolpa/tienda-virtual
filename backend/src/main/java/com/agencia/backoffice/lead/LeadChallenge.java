package com.agencia.backoffice.lead;

public enum LeadChallenge {

    MODERNIZATION("Modernizar un sistema"),
    INTEGRATIONS("Integrar sistemas"),
    CUSTOM_DEVELOPMENT("Desarrollo a la medida"),
    STAFF_AUGMENTATION("Staff augmentation técnico");

    private final String label;

    LeadChallenge(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}

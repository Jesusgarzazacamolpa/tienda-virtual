CREATE TABLE leads (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name  VARCHAR(120) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    company    VARCHAR(160) NOT NULL,
    challenge  VARCHAR(40)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_created_at ON leads (created_at DESC);

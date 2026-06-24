-- Migration: support demi-journee RTT et recompense apres 3 refus
-- Date: 2026-04-10

USE coreflow;

ALTER TABLE soldes_conges
  MODIFY COLUMN rtt_total DECIMAL(6,1) DEFAULT 10.0,
  MODIFY COLUMN rtt_pris DECIMAL(6,1) DEFAULT 0.0;

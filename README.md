# AgeProof

## Purpose
Advocate for age verification systems that prove an age threshold (e.g. over 18) without requiring identity collection, ID uploads, selfies, or centralized tracking.

This project combines policy advocacy, threat modeling, technical standards analysis, and a working prototype — all aimed at demonstrating that privacy-preserving age verification is possible today, and that identity harvesting is a choice, not a requirement.

## Core belief
Age verification is not the same as identity verification.

A website should only receive a yes/no answer (or an age range), not a name, birthdate, ID number, or photo.

## Why this matters
Many current proposals push websites toward collecting highly sensitive identity artifacts:
- government ID images
- selfies
- full birthdates
- persistent identity records

This creates an unavoidable risk of:
- breaches
- blackmail
- doxxing
- stalking
- identity theft
- permanent linkage between identity and browsing history

The risk scales with adoption. The larger the system, the more valuable it becomes as a target.

## Better approaches exist
Privacy-preserving alternatives already exist and can be implemented without storing identity data:

- Attribute verification (prove "over 18" only)
- Anonymous credentials / selective disclosure
- On-device verification (scan ID locally, never upload)
- Trusted issuer tokens (bank, carrier, government, wallet-based)

## This is already happening in Europe
The EU Digital Identity Wallet (EUDI), mandated under eIDAS 2.0, requires all EU member states to provide citizens with a government-backed digital identity wallet by 2026. Pilot programs are already running.

EUDI uses exactly the architecture this project advocates for:
- credentials held by the user, not websites
- selective disclosure — websites receive only what they need
- open standards (OpenID4VCI, OpenID4VP, SD-JWT)
- no ID uploads to relying parties

This is the strongest available evidence that privacy-preserving age verification is not theoretical. It is being mandated and deployed at national scale right now. Other jurisdictions face the same policy choice.

## Standards
This project references open standards that support privacy-preserving proofs:

- W3C Verifiable Credentials (VC)
- W3C Decentralized Identifiers (DID)
- OpenID for Verifiable Credential Issuance (OpenID4VCI)
- OpenID for Verifiable Presentations (OpenID4VP)
- Selective Disclosure JWT (SD-JWT)

## Advocacy goals
- Shift public discourse from "age verification" to "attribute proof vs identity harvesting"
- Promote policy requirements that explicitly forbid ID uploads and storage by websites
- Encourage certified verifier / issuer models with auditing requirements
- Encourage open standards, interoperability, and multiple issuer options
- Cite EUDI as evidence that this approach is legally mandated and technically deployable today

## Prototype
A working prototype is planned that demonstrates the full flow using the same standards EUDI is built on:

- **Issuer**: walt.id open-source tooling (Docker), simulating a government or bank issuer
- **Wallet**: walt.id web wallet, storing the credential on the user's device
- **Relying website**: custom-built, showing exactly what the site receives (age_over_18: true — nothing else)

See `plans/2026-02-17-prototype-plan.md` for the full plan.

## Documents
| File | Contents |
|---|---|
| `docs/00-project-brief.md` | Full project brief and goals |
| `docs/01-policy-checklist.md` | Policy requirements for lawmakers and advocates |
| `docs/02-threat-model.md` | How age verification systems fail and who is harmed |
| `docs/03-standards-map.md` | Technical standards and EUDI alignment |
| `docs/04-plain-language-explainer.md` | Non-technical explainer for press and policymakers |
| `docs/05-diagrams.md` | Diagrams of the good and bad models |
| `plans/2026-02-17-prototype-plan.md` | Prototype architecture and implementation plan |

## The simplest test
If a website can say "upload your ID and a selfie to continue" — the policy has failed.

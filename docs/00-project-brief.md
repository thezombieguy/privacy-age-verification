# Privacy-Preserving Age Verification - Project Brief

## 1. Purpose
Build an advocacy-focused project that promotes age verification methods that do not require identity collection (ID uploads, selfies, DOB storage) by websites.

This project may also include a reference implementation to demonstrate that privacy-preserving age verification is possible using existing open standards.

## 2. The problem
Many proposed age verification regimes effectively force identity verification by:

- requiring upload of government ID images and selfies
- encouraging websites and vendors to store highly identifying artifacts
- creating breach, tracking, and surveillance risk at massive scale

The result is a high-risk ecosystem where private companies become de facto identity vaults.

## 3. Core principle
Age verification should prove only an age threshold or age range, not identity.

Minimum disclosure should be the baseline.

A "yes/no" answer is sufficient for most age-gating use cases.

## 4. Why naive implementations are dangerous
If websites collect IDs, the risk is not hypothetical.

This creates an unavoidable threat of:

- data breaches of ID artifacts
- identity theft and fraud
- doxxing and stalking
- blackmail and harassment
- outing of vulnerable populations
- permanent linkage between identity and browsing history

This risk scales with adoption. The larger the system becomes, the more valuable it becomes as a target.

## 5. Privacy-preserving approaches (conceptual)
Better approaches already exist and can be implemented without identity storage by relying websites:

### 5.1 Attribute verification (not identity verification)
Prove "over 18" without revealing name, birthdate, or ID number.

### 5.2 Anonymous credentials / selective disclosure
Use cryptographic credentials that support revealing only the minimum required claim.

### 5.3 Trusted issuer tokens (age pass model)
A trusted issuer (government, bank, carrier, wallet provider) issues an "age token."
Websites receive only a yes/no result or a signed claim.

### 5.4 On-device verification
A device verifies an ID locally, extracts only age threshold, and never uploads ID images.

## 6. Standards and ecosystems to align with
This project will reference and align with open standards that support privacy-preserving proofs:

- W3C Verifiable Credentials (VC)
- W3C Decentralized Identifiers (DID)
- OpenID for Verifiable Presentations (OpenID4VP)
- OpenID for Verifiable Credential Issuance (OpenID4VCI)
- Selective Disclosure JWT (SD-JWT)

## 6a. Real-world precedent: EU Digital Identity Wallet (EUDI)

The EU Digital Identity Wallet, mandated under eIDAS 2.0, is the most significant evidence that this architecture is viable at scale.

All EU member states are required to deploy government-backed digital identity wallets by 2026, using the same standards listed above. Pilot programs are running now.

This project will cite EUDI as evidence that:

- privacy-preserving age verification is technically deployable today
- governments can mandate minimum disclosure as a legal requirement
- the remaining barriers in other jurisdictions are political, not technical

EUDI demonstrates that the choice between identity harvesting and privacy-preserving verification is a policy decision, not a technical constraint.

## 7. Advocacy goals
This project prioritizes advocacy and policy outcomes.

Key goals include:

- Shift discourse from "age verification" to "attribute proof vs identity harvesting"
- Promote policy requirements that forbid ID uploads and storage by relying websites
- Promote certified verifier / issuer models with audits and penalties
- Encourage open standards, interoperability, and multiple issuer options
- Encourage threat-model-driven thinking and breach impact minimization

## 8. If building a reference implementation, what it must NOT do
Any implementation included in this project must not:

- collect or store ID images
- store date of birth, legal name, or ID numbers at relying websites
- create cross-site tracking identifiers
- create centralized logs that can reconstruct browsing history
- require users to repeatedly upload documents to new sites

## 9. If building, what it SHOULD demonstrate
A reference implementation should demonstrate:

- A verifier receives only a yes/no result or minimal proof
- Proof is unlinkable across relying parties
- Credential is stored by the user (wallet model), not websites
- Threat model and breach impact are near-zero for relying sites
- The system supports multiple issuers (no monopoly by design)

## 10. Threat model summary (high level)
Primary risks:

- breach of ID artifacts stored by websites or vendors
- cross-site tracking via shared identifiers
- issuer log correlation (issuer sees where proofs are used)
- coercion or secondary use by platforms or governments
- normalization of identity checks for general internet access

Mitigations:

- minimal disclosure tokens
- unlinkable presentations
- local storage and user-controlled wallet
- strict retention limits and auditing requirements
- multiple issuers to reduce centralization

## 11. Open questions and research topics
This project will collect research and analysis on:

- which jurisdictions and proposed laws should be tracked and summarized
- which standards are most deployable today (SD-JWT vs BBS+ vs others)
- what policy language best encodes minimum disclosure and no retention
- how to handle fraud and repeated attempts without tracking identity
- how to ensure verification does not become a tool for surveillance
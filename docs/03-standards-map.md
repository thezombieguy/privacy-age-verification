# Standards Map - Privacy-Preserving Age Verification

This document explains the major open standards and ecosystems that can support privacy-preserving age verification.

The goal is not to prescribe a single implementation, but to show that:

- privacy-preserving age verification is technically possible today
- open standards already exist
- identity collection by websites is not necessary for compliance

---

## 1. What problem the standards need to solve

A privacy-preserving age verification system should allow a user to prove:

- "I am over 18"
- or "I am over 16"
- or "I am in an allowed age band"

Without revealing:

- name
- date of birth
- ID number
- address
- photos
- a persistent identifier that enables cross-site tracking

This is commonly described as:

- attribute verification
- selective disclosure
- derived predicates (example: age >= 18)
- minimal disclosure proofs

---

## 2. The three roles in most systems

Most standards-based approaches describe three distinct roles:

### 2.1 Issuer
A trusted entity that can issue a credential containing claims about the user.

Examples:
- government digital ID system
- bank (KYC)
- mobile carrier (account verified)
- accredited third-party issuer

### 2.2 Holder
The user, typically via a wallet application.

The holder stores credentials and chooses what to present.

### 2.3 Verifier (relying party)
The website or service that needs an age proof.

The verifier should receive only:
- yes/no (meets threshold)
- or age band

---

## 3. W3C Verifiable Credentials (VC)

### What it is
The W3C Verifiable Credentials standard defines a common format for digital credentials that are:

- cryptographically signed
- verifiable by third parties
- interoperable across ecosystems

### Why it matters
It provides a standardized way for an issuer to say:

- "This holder has attribute X"

And for a verifier to confirm the issuer really said it.

### Key point
VCs are not inherently privacy-preserving on their own.

Privacy depends on:

- what data is inside the credential
- how presentations are generated
- what cryptographic proof format is used
- whether presentations are linkable

---

## 4. W3C Decentralized Identifiers (DID)

### What it is
A DID is a type of identifier designed to be:

- user-controlled
- decentralized
- resolvable to public keys and service endpoints

### Why it matters
DIDs can support systems where:

- users do not need accounts at every verifier
- credentials can be verified without centralized identity databases

### Key point
DIDs are useful, but not required for all privacy-preserving systems.

Some ecosystems use DIDs heavily.
Others use simpler issuer key registries or trust frameworks.

---

## 5. OpenID for Verifiable Presentations (OpenID4VP)

### What it is
OpenID4VP is a protocol for requesting and presenting verifiable credentials using patterns similar to:

- OAuth 2.0
- OpenID Connect

It is designed for web and mobile environments.

### Why it matters
It defines how a website can request:

- proof of age

And how a wallet can respond with:

- a verifiable presentation

### Key point
This is the piece that makes VC systems usable on the web.

Without a presentation protocol, VCs are just a data format.

---

## 6. OpenID for Verifiable Credential Issuance (OpenID4VCI)

### What it is
OpenID4VCI defines how a credential is issued into a user's wallet.

### Why it matters
A real system needs both:

- issuance (getting the credential)
- presentation (proving it later)

---

## 7. SD-JWT (Selective Disclosure JWT)

### What it is
SD-JWT is an approach that uses JSON Web Tokens (JWTs) while supporting selective disclosure.

Instead of revealing an entire credential, the holder can reveal only selected claims.

Example:
- reveal "age_over_18": true
- do not reveal "birthdate": 2001-05-10

### Why it matters
It is widely considered one of the most practical and deployable approaches today because:

- it aligns with existing JWT ecosystems
- it integrates well with OpenID flows
- it is easier to deploy than some ZKP-based schemes

### Key limitation
Selective disclosure is not the same as unlinkability.

A poorly designed SD-JWT system can still enable correlation across sites if:

- presentations reuse identifiers
- issuers embed stable identifiers
- verifiers request too much

---

## 8. BBS+ signatures and ZKP-style credentials

### What they are
Some credential proof formats support stronger privacy properties, including:

- unlinkable presentations
- derived predicates (example: prove age >= 18 without revealing DOB)

These are sometimes associated with:

- BBS+ signatures
- anonymous credentials
- zero-knowledge proof systems

### Why they matter
These can provide the strongest privacy guarantees, especially for:

- unlinkability across verifiers
- proving thresholds without disclosing underlying attributes

### Key limitation
They are often harder to deploy at scale today due to:

- ecosystem maturity
- tooling complexity
- wallet support differences

---

## 9. Trust frameworks (the missing layer)

Most standards define:

- data formats
- cryptographic verification
- protocol flows

But they do not automatically define:

- who is allowed to issue credentials
- how issuer keys are trusted
- how auditing works
- how revocation works

In practice, privacy-preserving age verification requires a trust framework defining:

- issuer accreditation
- audit requirements
- compliance rules
- revocation and fraud handling
- legal restrictions on retention and tracking

---

## 10. What a standards-aligned age proof looks like

A standards-aligned system can be designed so the verifier receives only:

- "age_over_18": true
- issuer signature verification success
- proof freshness (optional)
- no persistent identifier

It should not receive:

- DOB
- name
- ID number
- address
- face image

---

## 11. What NOT to do (common failures)

Even when using open standards, a system can fail privacy goals if:

- the issuer includes stable identifiers in credentials
- the verifier requests full DOB instead of threshold
- the wallet presentation is linkable across verifiers
- the verifier or issuer logs all requests indefinitely
- the verifier embeds third-party tracking SDKs in the verification flow

Standards do not guarantee privacy by default.

Privacy must be required by policy and enforced by implementation.

---

## 12. Summary

Privacy-preserving age verification is feasible today.

A standards-aligned ecosystem typically includes:

- W3C Verifiable Credentials (credential data model)
- DID (optional identity and key discovery layer)
- OpenID4VP (presentation protocol)
- OpenID4VCI (issuance protocol)
- SD-JWT or ZKP-capable proof formats (selective disclosure and privacy)

The remaining question is not technical feasibility.

It is policy, incentives, and whether privacy requirements are mandated instead of optional.
# Policy Checklist - Privacy-Preserving Age Verification

This checklist is intended for lawmakers, regulators, journalists, and advocates.

It defines the minimum requirements needed to ensure that "age verification" does not become identity harvesting, surveillance infrastructure, or a permanent record of lawful internet use.

---

## 1. Core requirement: age verification must not require identity verification

A compliant system must be able to prove:

- "User is over X" (example: 16, 18, 21)
- or "User is in an age band" (example: 13-15, 16-17, 18+)

Without requiring:

- legal name
- date of birth disclosure
- government ID number disclosure
- photo or selfie collection
- address disclosure

---

## 2. Relying websites must not collect or store identity documents

Relying websites (the sites being accessed) must be prohibited from collecting or storing:

- scans or photos of IDs
- selfies or biometric face scans
- full date of birth
- government ID numbers
- address details

This includes both direct collection and collection via third-party SDKs embedded on the site.

---

## 3. Minimum disclosure must be mandatory

The default verification result returned to a website must be:

- yes/no (meets threshold)
- or age band only

Not:

- date of birth
- exact age
- identity details
- persistent identifiers

---

## 4. Verification providers must be licensed and audited

If third-party age verification providers are permitted, they must be:

- licensed under a defined regulatory regime
- subject to security audits
- subject to breach reporting requirements
- subject to penalties for non-compliance
- subject to data minimization rules

The goal is to prevent every website from becoming its own unregulated identity vault.

---

## 5. Strong restrictions on retention and secondary use

Verification providers must be prohibited from:

- retaining ID artifacts beyond the minimum required to issue a credential
- building behavioral profiles of verification activity
- selling or sharing verification data
- using verification activity for marketing or tracking

Retention must be explicitly defined in law, not left to policy.

---

## 6. Unlinkability must be a design requirement

A compliant system must prevent:

- cross-site tracking via a shared token or identifier
- creation of a universal "verified adult" ID number
- linking verification activity across unrelated services

A user proving age on Site A must not create a technical identifier usable to track them on Site B.

---

## 7. Verification must not create browsing history reconstruction risk

The system must not enable any party (websites, vendors, issuers, government agencies) to reconstruct a user's browsing history through:

- verification logs
- token re-use
- centralized verification events
- issuer correlation

---

## 8. Multiple issuers must be allowed (no single point of control)

The law should require interoperability and allow multiple trusted issuers, such as:

- government-issued credentials
- banks
- mobile carriers
- accredited private issuers
- OS wallet providers (where applicable)

No law should create a monopoly verifier.

---

## 9. Support for open standards should be required

A compliant system should be based on open standards to ensure interoperability and prevent vendor lock-in.

Examples of relevant standards ecosystems include:

- W3C Verifiable Credentials
- W3C Decentralized Identifiers
- OpenID for Verifiable Credential Issuance (OpenID4VCI)
- OpenID for Verifiable Presentations (OpenID4VP)
- Selective Disclosure JWT (SD-JWT)

---

## 10. No biometric requirements for age verification

A compliant system must not require:

- face scans
- voice prints
- biometric templates
- behavioral biometrics

Age gating does not justify biometric surveillance.

---

## 11. No mandatory real-name policies

Age verification must not be used to enforce:

- real-name policies
- government-name identity linkage
- permanent account identity binding

Age verification is a narrow attribute proof, not a social identity system.

---

## 12. Equal-access requirement (no exclusion by design)

A compliant system must not exclude people who:

- do not have a driver's license
- do not have passports
- cannot safely share identity artifacts
- are vulnerable to coercion (example: domestic abuse situations)

The law should require multiple privacy-safe verification methods.

---

## 13. Security requirements must be explicit

Any approved verification provider must meet minimum security requirements including:

- encryption in transit and at rest
- strict access controls
- mandatory breach disclosure
- independent penetration testing
- secure deletion guarantees

---

## 14. Clear definitions must be included in law

Laws should explicitly define:

- "age verification"
- "identity verification"
- "relying party"
- "issuer"
- "verification provider"
- "minimum disclosure"
- "retention"
- "unlinkability"

Without these definitions, the law will default to the worst interpretation.

---

## 15. The simplest compliance test

If a website can say:

- "Upload your ID and a selfie to continue"

Then the law has failed.

The law must explicitly prevent that outcome.

---

## Summary: the policy objective in one sentence

Age verification should prove only age, not identity, and must not create centralized logs, cross-site tracking, or ID document databases.

---
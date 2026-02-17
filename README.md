# Privacy-Preserving Age Verification

## Purpose
Advocate for age verification systems that prove an age threshold (ex: over 18) without requiring identity collection, ID uploads, selfies, or centralized tracking.

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

## Better approaches exist
Privacy-preserving alternatives already exist and can be implemented without storing identity data:

- Attribute verification (prove “over 18” only)
- Anonymous credentials / selective disclosure
- On-device verification (scan ID locally, never upload)
- Trusted issuer tokens (bank, carrier, government, wallet-based)

## Standards to align with
This project will reference open standards that support privacy-preserving proofs:

- W3C Verifiable Credentials (VC)
- W3C Decentralized Identifiers (DID)
- OpenID for Verifiable Presentations (OpenID4VP)
- Selective Disclosure JWT (SD-JWT)

## Advocacy goals
- Shift public discourse from “age verification” to “attribute proof vs identity harvesting”
- Promote policy requirements that explicitly forbid ID uploads and storage by websites
- Encourage certified verifier / issuer models with auditing requirements
- Encourage open standards, interoperability, and multiple issuer options

## If a reference implementation is built
It must NOT:
- collect or store ID images
- store date of birth, legal name, or ID numbers
- create cross-site tracking identifiers
- create centralized logs that reconstruct browsing history

It SHOULD:
- demonstrate a verifier receiving only a yes/no proof
- support unlinkable presentations across sites
- keep credentials user-held (wallet model)
- include a clear threat model and failure mode analysis
# Prototype Plan - Privacy-Preserving Age Verification
Date: 2026-02-17

---

## Goal

Build a small, self-contained working prototype that demonstrates the full privacy-preserving age verification flow end-to-end. The prototype must serve both as a technical foundation and as a convincing advocacy demo for policy and press audiences.

---

## Components

Three components, running locally, covering the complete flow:

| Component | Role |
|---|---|
| **Issuer service** | Simulated trusted issuer (labeled "Demo Gov Issuer"). Issues a signed SD-JWT credential containing only `age_over_18: true`. Stores nothing after issuance. |
| **Browser wallet** | A simple web page the user visits after issuance. Stores the credential in `localStorage` (device-side, no server). Presents a proof on demand. |
| **Relying website** | A demo site that requests age proof, verifies the SD-JWT signature, and displays only what it received — making it explicit that no DOB, name, or ID was shared. |

---

## Credential Format: SD-JWT

SD-JWT is the right choice for this prototype because:

- It is the most deployable format today with solid library support
- It maps directly to what the project documents describe (selective disclosure, yes/no proof)
- It aligns with the IETF draft standard that governments and the EU EUDI wallet are converging on
- It is significantly simpler to implement than full W3C VC with BBS+ signatures

The credential will contain only: `age_over_18: true` — no date of birth, no name, no ID number.

---

## Tech Stack: Node.js / TypeScript

Reasons:

- Best SD-JWT library support (`@sd-jwt/core`, `jose`)
- All three components can run as simple Express servers plus static HTML
- Easy to run locally with a single `npm install && npm start`
- PHP is not well-suited for the cryptographic primitives required here

---

## The Flow

```
1. User visits Issuer  →  clicks "Get age credential"
   (In real life: issuer verifies DOB via gov record; here it is a button for demo purposes)

2. Issuer generates SD-JWT signed with its private key
   → returns credential to browser

3. Browser wallet stores credential in localStorage

4. User visits Relying Website  →  clicks "Prove I'm over 18"

5. Wallet presents a derived proof (SD-JWT presentation)
   → sent to Relying Website

6. Relying Website verifies issuer signature
   → displays: "age_over_18: true — no other data received"
```

---

## Effort Estimate

| Task | Effort |
|---|---|
| Issuer service (keygen, SD-JWT issuance endpoint) | ~0.5 days |
| Browser wallet (store credential, generate presentation) | ~1 day |
| Relying website (verify proof, display result) | ~0.5 days |
| Wiring, local dev setup, README | ~0.5 days |
| **Total** | **~2–3 days** |

No database, no auth, no deployment required. Everything runs locally.

---

## In Scope

- Issuer generates and signs an SD-JWT credential with `age_over_18: true`
- User wallet stores credential in browser `localStorage`
- Relying website requests a proof, verifies the issuer signature, and displays only the result
- Clear UI labels showing what data the relying party does and does not receive
- Local dev setup with a single start command

---

## Out of Scope (for this prototype)

- Unlinkability across verifier requests (requires BBS+ or ZKP — significantly more complex)
- Credential revocation
- Real issuer integration (no public gov/bank issuance APIs exist yet)
- Mobile wallet (browser only)
- Production security hardening
- Deployment

---

## Issuer Note

Real-world issuers (government, bank, mobile carrier) do not yet expose public SD-JWT issuance APIs. The prototype will use a clearly labeled simulated issuer. The architecture is real and replaceable — when production issuers exist, only the issuer component needs to be swapped out. This is the standard approach used by all major VC ecosystem demos today.

---

## What the Prototype Demonstrates

- The relying website receives **only** `age_over_18: true` and a valid cryptographic signature — nothing else
- The credential lives **on the user's device**, not on any server
- The issuer issues and forgets — no log of what was issued to whom
- Privacy-preserving age verification is technically feasible today using existing open standards

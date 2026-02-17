# Diagrams - Privacy-Preserving Age Verification

This file contains simple diagrams illustrating how privacy-preserving age verification can work, and how identity-harvesting implementations typically work.

These diagrams use Mermaid syntax, which renders in GitHub Markdown.

---

## Diagram 1 - Privacy-Preserving Age Verification (Good Model)

```mermaid
flowchart LR
  U[User] -->|Requests age credential| I[Trusted Issuer<br>(Gov / Bank / Carrier)]
  I -->|Issues credential<br>(stored on device)| W[User Wallet<br>(phone)]
  RP[Relying Website] -->|Requests proof:<br>Over 18?| W
  W -->|Returns proof:<br>Yes/No only| RP
  RP -->|Grants or denies access| U

  note1((No ID upload to websites))
  note2((No DOB shared))
  note3((No name shared))
  note4((No cross-site identifier))

  RP --- note1
  RP --- note2
  RP --- note3
  RP --- note4
```

---

## Diagram 2 - Identity Harvesting Model (Bad Model)

```mermaid
flowchart LR
  U[User] -->|Uploads ID + selfie| RP[Relying Website]
  RP -->|Sends identity artifacts| V[Verification Vendor]
  V -->|Stores ID images, selfies,<br>DOB, logs| DB[(Central Database)]
  V -->|Returns pass/fail| RP
  RP -->|Grants access| U

  A[Attackers / Breach] -->|Target| DB
  LE[Government / Legal Requests] -->|Subpoenas / Warrants| DB

  note1((Creates permanent identity vault))
  note2((Enables cross-site tracking))
  note3((Breach exposes browsing behavior))

  DB --- note1
  DB --- note2
  DB --- note3
```

---

## Diagram 3 - What the Website Should Receive (Minimum Disclosure)

```mermaid
sequenceDiagram
  participant RP as Website
  participant W as User Wallet
  participant I as Issuer

  RP->>W: "Prove you are over 18"
  W->>I: (No call required)\nUses issuer signature already stored
  W->>RP: Proof: age_over_18 = true\nIssuer signature valid
  RP->>RP: Store only: "age_verified = true"
```

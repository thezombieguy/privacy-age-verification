# Threat Model - Privacy-Preserving Age Verification

This document describes how age verification systems fail, who is harmed, and why privacy-preserving designs are not optional.

The goal is to ensure that "age verification" does not become a permanent identity and surveillance layer for general internet use.

---

## 1. Scope

This threat model covers age verification systems used for access to:

- social media
- adult content
- forums and chat platforms
- gaming and streaming services
- any website required by law to restrict access by age

This document focuses on age-gating systems that involve:

- ID upload
- selfie verification
- third-party verification providers
- credential issuance and presentation
- verification logs and retention

---

## 2. Assets at risk

Age verification systems often collect or generate extremely sensitive assets.

These include:

- government ID scans (front/back)
- selfies and face images
- date of birth
- legal name and address
- government ID numbers
- device identifiers
- verification event logs (timestamps, IPs, sites visited)
- persistent tokens that can be reused or correlated

The most dangerous asset is not a single piece of data.

It is the combination of:

- identity + verification history + site category

---

## 3. Actors

### 3.1 Users
Adults and minors attempting to access services.

### 3.2 Relying parties
Websites requiring age checks (social networks, adult sites, etc.).

### 3.3 Verification providers
Third-party vendors that perform age checks.

### 3.4 Issuers
Entities that can assert age attributes (government, bank, carrier, wallet provider).

### 3.5 Attackers
- criminal hackers
- identity thieves
- extortion groups
- stalkers
- abusive partners
- doxxers
- organized harassment groups

### 3.6 Government and law enforcement
May request logs via subpoena, warrant, or policy expansion.

---

## 4. Threats and failure modes

---

## 4.1 Data breach of ID artifacts

### Description
A verification provider or website stores ID scans and selfies.

These systems are breached.

### Impact
- identity theft
- financial fraud
- account takeover
- document forgery
- long-term personal risk (IDs do not rotate easily)

### Why it is severe
A password breach is recoverable.

A driver's license breach is permanent.

---

## 4.2 Blackmail and extortion

### Description
A breach exposes:

- identity documents
- proof of adult status
- and the category of websites accessed

### Impact
- extortion attempts
- coercion
- harassment
- reputational damage
- workplace consequences

### High-risk populations
- public figures
- teachers and caregivers
- LGBTQ individuals
- politically vulnerable groups
- anyone in conservative communities

---

## 4.3 Doxxing and stalking

### Description
Identity artifacts include addresses and full names.

Attackers use these to locate individuals.

### Impact
- stalking
- harassment
- physical safety risk
- domestic abuse escalation

---

## 4.4 Outing and forced disclosure

### Description
Verification logs or leaked credentials can reveal:

- sexual orientation
- gender identity
- relationship status
- personal interests
- political beliefs

Even if the site itself is legal.

### Impact
- forced outing
- harassment and violence
- job loss
- family conflict

---

## 4.5 Cross-site tracking via shared identifiers

### Description
A verifier issues a reusable token or identifier.

Multiple websites use the same verification provider.

The provider (or embedded SDK) can correlate:

- the same person
- across multiple sites

### Impact
- de-anonymization
- behavioral profiling
- advertising enrichment
- persistent tracking outside consent

### Key observation
Even if the verifier never shares identity with websites, the verifier itself becomes a tracking hub.

---

## 4.6 Centralized log correlation

### Description
Verification providers log events such as:

- time
- IP address
- device fingerprint
- requesting domain
- result

Even if identity is not stored long-term, logs can be correlated.

### Impact
- browsing history reconstruction
- creation of a shadow database of lawful activity

---

## 4.7 Function creep (policy expansion)

### Description
A system is built "for children."

Over time it expands to:

- political speech moderation
- real-name enforcement
- anti-anonymity rules
- broader internet access requirements
- "anti-extremism" compliance
- general digital ID requirements

### Impact
- normalization of identity checks for everyday use
- loss of anonymous speech
- chilling effects on lawful expression

---

## 4.8 Coercion and abuse scenarios

### Description
An abusive partner demands:

- access to verification records
- proof of which sites were accessed
- control of identity documents

### Impact
- increased coercive control
- threats and violence
- forced monitoring of private behavior

---

## 4.9 False positives and exclusion

### Description
Some systems reject valid users due to:

- document mismatch
- lighting or camera issues
- name changes
- immigration status
- inability to provide documents

### Impact
- exclusion from lawful speech platforms
- disproportionate harm to marginalized groups
- creation of a "papers please" internet

---

## 4.10 Fraud incentives and black market creation

### Description
When access requires identity proof, markets emerge for:

- stolen IDs
- fake selfies
- purchased verification accounts

### Impact
- increased identity theft
- increased fraud
- criminals become more sophisticated

### Key observation
Centralized identity checks often create stronger fraud incentives than they solve.

---

## 4.11 Child safety failure

### Description
Systems that rely on ID uploads do not prevent minors from accessing content.

They often shift minors toward:

- unregulated sites
- offshore platforms
- credential sharing
- black market tokens

### Impact
- minors still access content
- but everyone loses privacy

This is a high-cost, low-effect tradeoff.

---

## 5. Why relying parties must not collect identity

Websites are not equipped to safely store:

- IDs
- selfies
- DOB
- identity metadata

Even large technology companies routinely experience breaches.

Age verification laws that allow relying parties to collect identity data create a distributed, unavoidable breach surface.

---

## 6. Why third-party verifiers are also dangerous if mis-designed

Even if websites do not store identity data, a centralized verifier can become:

- a tracking hub
- a browsing history database
- a single point of failure

A privacy-preserving solution must minimize both:

- website-side data collection
- verifier-side correlation ability

---

## 7. Mitigation principles

The following principles mitigate most threats:

### 7.1 Minimum disclosure
Return only:

- yes/no
- or age band

### 7.2 Unlinkability
Prevent correlation across sites.

### 7.3 User-held credentials
Keep credentials on-device or in a user-controlled wallet.

### 7.4 No ID retention
ID artifacts must not be stored after issuance.

### 7.5 Multiple issuers
Avoid a single centralized control point.

### 7.6 No biometric requirements
Avoid turning age gating into biometric surveillance.

### 7.7 Strict retention rules
Logs must be minimized and retention must be legally defined.

---

## 8. The policy test

A system fails this threat model if:

- users must upload ID scans or selfies to websites
- websites store DOB or identity details
- a verifier can correlate activity across sites
- verification logs can reconstruct browsing history
- the system enables government or vendor overreach via centralized control

---

## 9. Summary

Age verification systems can be implemented in a privacy-preserving way.

If they are not, the predictable result is:

- large-scale identity collection
- unavoidable breaches
- browsing history reconstruction risk
- normalization of surveillance
- disproportionate harm to vulnerable populations

Privacy-preserving design is not an optional improvement.

It is the minimum requirement for safety.
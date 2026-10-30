# 🔐 CryptoVault — One-Page Interactive Caesar Cipher Slide Lab

> A brief, visually stunning, one-page slide application demonstrating encryption, decryption, and Caesar Cipher cryptographic system architecture.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Slide-Based Structure](#-slide-based-structure)
- [Slide Breakdown](#-slide-breakdown)
  - [Slide 1: 🔒 Encryption Workspace](#slide-1--encryption-workspace)
  - [Slide 2: 🔓 Decryption Workspace](#slide-2--decryption-workspace)
  - [Slide 3: 💡 How The System Works](#slide-3--how-the-system-works)
- [Caesar Cipher Algorithm](#-caesar-cipher-algorithm)
- [How to Run](#-how-to-run)
- [Technologies Used](#-technologies-used)

---

## 🌐 Overview

**CryptoVault** is designed as a **one-page slide application**:
- **Brief & Focused**: Eliminates unnecessary scrolling with concise, interactive slide views.
- **Fluid Slide Transitions**: Smooth horizontal sliding between steps with tab buttons, arrow keys ($\leftarrow$ and $\rightarrow$), and dot pagination.
- **Seamless Auto-Sync**: Ciphertext and shift values created on Slide 1 instantly populate Slide 2.
- **Educational System Breakdown**: Dedicated Slide 3 explaining the complete mathematical lifecycle and cryptographic principles.
- **Clean Aesthetic**: White background theme, subtle floating particles, vibrant indigo and emerald accents, with no footer.

---

## 📑 Slide-Based Structure

```
                           ┌── CryptoVault Header ──┐
                           │ [1. Encrypt] [2. Decrypt] [3. How It Works] │
                           └────────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
  ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
  │     SLIDE 1     │          │     SLIDE 2     │          │     SLIDE 3     │
  │   ENCRYPTION    │  slide   │   DECRYPTION    │  slide   │  HOW IT WORKS   │
  │  Plain Text ➔   │─────────►│  Cipher Text ➔  │─────────►│  Mathematical   │
  │   Cipher Text   │          │   Plain Text    │          │  Architecture   │
  └─────────────────┘          └─────────────────┘          └─────────────────┘
```

---

## 🖥️ Slide Breakdown

### Slide 1: 🔒 Encryption Workspace
- **Input**: Enter plaintext with live character count.
- **Shift Key Stepper**: Choose shift value ($K \in [1, 25]$) with $+ / -$ buttons and numeric input.
- **Mini-Wheel Preview**: Live sample showing shifted alphabet pairs ($A \rightarrow D$, $B \rightarrow E$).
- **One-Click Slide**: **"🔒 Encrypt & Slide →"** encrypts your text and slides directly to Slide 2.
- **Step Visualizer**: Live character breakdown showing index, formula $(+K)$, and resulting ciphertext character.

### Slide 2: 🔓 Decryption Workspace
- **Auto-Import**: Automatically receives ciphertext from Slide 1 upon arrival.
- **Sync Button**: "📥 Sync from Encrypt" button to re-fetch latest encryption output at any time.
- **Reverse Key Stepper**: Adjust shift key with live reverse preview ($D \rightarrow A$).
- **Output**: Instant recovery of plain text with one-click clipboard copy.
- **Reverse Step Visualizer**: Shows $C \xrightarrow{-K} P$ character decoding.

### Slide 3: 💡 How The System Works
A brief, high-yield educational guide structured into 4 interactive cards:
1. **The Lifecycle Pipeline**:
   $$\text{Plain Text} \xrightarrow{+K} \text{Cipher Text} \xrightarrow{-K} \text{Recovered Plain Text}$$
2. **Modular Arithmetic**:
   - Encryption: $C = (P + K) \pmod{26}$
   - Decryption: $P = (C - K + 26) \pmod{26}$
3. **Interactive Alphabet Shift Explorer**:
   - Live range slider that rotates the entire alphabet $A\text{–}Z$ in real-time.
4. **Cryptographic Concepts**:
   - Symmetric key sharing, brute-force vulnerabilities ($25$ keys), and frequency analysis.

---

## 🔑 Caesar Cipher Algorithm

The Caesar Cipher replaces each alphabet character with another character shifted by a constant key $K$:

| Operation | Mathematical Formula | Example ($K = 3$) |
|-----------|----------------------|-------------------|
| **Encryption** | $C = (P + K) \pmod{26}$ | $\text{'H'} (7) + 3 = 10 \rightarrow \text{'K'}$ |
| **Decryption** | $P = (C - K + 26) \pmod{26}$ | $\text{'K'} (10) - 3 = 7 \rightarrow \text{'H'}$ |

*Spaces, punctuation, numbers, and special characters remain unchanged.*

---

## ▶️ How to Run

1. Open a terminal in the project directory:
   ```bash
   npx serve . -l 3000
   ```
2. Navigate to **`http://localhost:3000`** in any browser.
3. Use the top pill navigation, pagination arrows, or keyboard **Left / Right arrow keys** to switch slides.

---

## 🛠️ Technologies Used

- **HTML5**: Semantic single-page slider architecture
- **CSS3**: Smooth CSS slide transitions (`translateX`), modern clean white design system
- **JavaScript (ES6+)**: Real-time cipher engine, keyboard shortcuts, particle canvas
- **Google Fonts**: Inter & JetBrains Mono

---
sidebar_position: 0
---

# Reverse Engineering with Ghidra SRE

Ghidra SRE is used as the main reverse engineering platform. All instructions and tools presented on the site are designed to work with Ghidra.

This guide will help you dive into the world of reverse engineering in just a few steps.

:::warning
Since around 2019, there has been a bug in Ghidra SRE: `FF FF` in the v5t architecture is recognized as the `BL 0xFFE` instruction. This causes an infinite loop in auto-analysis.

You **must** apply the [ARMTHUMBinstructions.sinc patch](./fixing-ghidra) if you plan to work with Siemens firmware.
:::

### What to Do Before Starting

1. Install the latest version of **Ghidra SRE** and apply the [ARMTHUMBinstructions.sinc patch](./fixing-ghidra)

2. Obtain the fullflash from the phone and remove FFS and EEPROM from it.

   This is important for auto-analysis, as FFS and EEPROM contain ambiguous data that can be interpreted as instructions.

   You can download a collection of firmware with FFS and EEPROM already removed: [fullflashes.zip](https://github.com/siemens-mobile-hacks/elfloader3/releases/download/v0/fullflashes.zip)

3. [Dump RAM and SRAM from your phone](./memory-dump.md).

### Step 1: Load Your fullflash.bin into Ghidra

   <details>
      ![](img/open-options.png)

      ![](img/open-options2.png)
   </details>

1. Launch the disassembler and select `File -> Import File`

2. Select the `fullflash.bin` file

3. Configure import settings:

   * Format: `Raw Binary`
   * Language: `ARM v5t 32 little`
   * Options → Block Name: `FULLFLASH`
   * Options → Base Address: `A0000000`

4. Click on `fullflash.bin` in the project list.

5. Ghidra will offer automatic analysis, you need to decline (**click No**).

### Step 2: Edit FULLFLASH Region Attributes

Go to `Window -> Memory Map` and set the attributes for the "FULLFLASH" block:

```
 R   W   X    Volatile
[x] [ ] [x]     [ ]
```

It is very important to uncheck `W`, as this directly affects decompilation.

### Step 3: Configure Auto-Analysis Settings

1. Select `Analysis -> Auto Analyse`

2. Change analysis settings:

   Disable:

   * [ ] `Embedded media`
   * [ ] `Non-returning functions - discovered` (otherwise the disassembler may prematurely stop inside a function)
   * [ ] `Create Address Tables` (better to run as one-shot after main analysis)
   * [ ] `Demangler GNU`

   Enable:

   * [x] `Scalar operand references`
   * [x] `Shared return calls` with option `[x] Allow conditional jumps`

3. Click **"APPLY"** but **DO NOT CLICK "ANALYZE"!!!**

4. Close the analysis window.

### Step 4: Memory Region for IO Registers

   <details> ![](img/io-memory-region.png) </details>

1. Go to `Window -> Memory Map`
2. Add a new region with parameters:

   * Block Name: `IO`
   * Start Addr: `0xF0000000`
   * Length: `0x0F000000`
   * Attributes: `[x] Read   [x] Write   [ ] Execute   [x] Volatile   [ ] Overlay`
   * Uninitialized

### Step 5: Import RAM Dump from the Phone

Import all previously obtained [memory dumps](./memory-dump.md).

Example with RAM:

1. `File -> Add to Program`
2. Select a file, for example: `C81v51_RAM_A8000000_00800000.bin`
3. Specify parameters:

   * Block Name: `RAM`
   * Base Addr: `0xA8000000`

   Click "OK".
4. Go to `Window -> Memory Map` and set attributes for the "RAM" block:

   ```
    R   W   X    Volatile
   [x] [x] [x]     [ ]
   ```

### Step 6: Plugins for Ghidra

<details> ![](img/add-scripts-dirs.png) </details>

1. Download: [ghidra\_scripts.zip](https://github.com/siemens-mobile-hacks/ghidra_scripts/archive/refs/heads/main.zip) or clone the [repository](https://github.com/siemens-mobile-hacks/ghidra_scripts)
2. Open `Window -> Script Manager`
3. Click on "Manage Script Directories"
4. Add the path to the unpacked `ghidra_scripts` folder.

### Step 7: Import C-Types from swilib

<details> ![](img/parse-c-source.png) </details>

1. Download the appropriate `swilib-types-PLATFORM.h` from [Swilib data types for disassembler](https://siemens-mobile-hacks.github.io/web-dev-tools/re#swilib-types)
2. Select `File -> Parse C Source...`
3. Click `Clear profile` (eraser icon)
4. Add `swilib-types-PLATFORM.h` to `Source files to parse`
5. Set `Program architecture`: `ARM v5t 32 little`
6. Click `Parse to Program -> Continue -> Don't use Open Archives -> OK`

### Step 9: Import CPU IO Register List

1. Download the corresponding `cpu-PHONE.txt` or `cpu-pmb887x.txt` from [CPU IO registers](https://siemens-mobile-hacks.github.io/web-dev-tools/re#cpu-registers)
2. Open `Window -> Script Manager -> ImportSymbolsWithDataType.java -> Run Script`
3. Select `cpu-PHONE.txt` or `cpu-pmb887x.txt`

### Step 10: Import swilib Symbols

<details> ![](img/finished.png) </details>

1. Download the appropriate `symbols-PHONE.txt` from [Firmware symbols for disassembler](https://siemens-mobile-hacks.github.io/web-dev-tools/re#swilib-symbols)
2. Open `Window -> Script Manager -> ImportSymbolsWithDataType.java -> Run Script`
3. Select `symbols-PHONE.txt`

This will take some time as auto-analysis will start.

When you see "Finished" in the script console — you can interrupt the analysis and proceed further.

### Step 11: Firmware Auto-Analysis

**Full Analysis**

1. Open `Analysis -> Auto Analyse 'fullflash.bin'`
2. Ensure the settings match those specified in **Step 3**
3. Click **ANALYSE**

This will take 10-30 minutes. The process is long — be patient.

**Run Only Once**

1. Select `Analysis -> One-shot -> Create Address Tables`

### Congratulations, You Did It! ✨

We look forward to your patches in the patch database <a href="https://patches.kibab.com">patches.kibab.com</a> :)

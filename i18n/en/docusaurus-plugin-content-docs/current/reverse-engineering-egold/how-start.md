---
sidebar_position: 0
---

# Reversing in Ghidra SRE

Ghidra SRE is used as the primary reverse engineering platform. All instructions and tools presented on the site are designed to work with Ghidra.

This guide will help you dive into the world of reverse engineering in just a few steps.

:::warning
The official version of Ghidra cannot handle far-pointers correctly. You **must** use the [patched version of Ghidra](https://github.com/siemens-mobile-hacks/ghidra-patched) when working with E-GOLD firmware.
:::

### What to do before you start

1. Install the [patched version of Ghidra](https://github.com/siemens-mobile-hacks/ghidra-patched).

2. Install [C166 support for Ghidra](https://github.com/siemens-mobile-hacks/c166-ghidra-module).
  You can do this in `File -> Install Extensions`

3. Obtain a fullflash from the phone.

4. Dump RAM and SRAM from your phone.

### Step 1: Find out the load base of your fullfhash

You can do this using [Smelter](https://web.archive.org/web/20090414122112/http://avkiev.kiev.ua/Siemens/Smelter/Smelter.htm).

   <details>
      ![](img/smelter.png)
   </details>

### Step 2: Load your fullflash.bin into Ghidra

   <details>
      ![](img/open-options.png)

      ![](img/open-options2.png)
   </details>

1. Launch the disassembler and select `File -> Import File`

2. Select the `fullflash.bin` file

3. Configure the import parameters:

   * Format: `Raw Binary`
   * Language: `Infineon C167CR	TASKING Classic large`
   * Options → Block Name: `FULLFLASH`
   * Options → Base Address: `200000` (enter the address shown in Smelter here)

4. Click `fullflash.bin` in the project list.

5. Ghidra will offer automatic analysis; you need to decline (**click No**).

### Step 3: Edit the FULLFLASH region attributes

Go to `Window -> Memory Map` and set the attributes for the "FULLFLASH" block:

```
 R   W   X    Volatile
[x] [ ] [x]     [ ]
```

It is very important to clear the `W` checkbox, as this directly affects decompilation.

### Step 3: Configure auto-analysis parameters

1. Select `Analysis -> Auto Analyse`

2. Change the analysis parameters:

   Disable:

   * [ ] `Embedded media`
   * [ ] `Non-returning functions - discovered` (otherwise the disassembler may stop prematurely inside a function)
   * [ ] `Create Address Tables` (it is better to run this as a one-shot after the main analysis)
   * [ ] `Demangler GNU`

   Enable:

   * [x] `Scalar operand references`
   * [x] `Shared return calls` with the option `[x] Allow conditional jumps`

3. Click **"APPLY"**, but **DO NOT CLICK "ANALYZE"!!!**

4. Close the analysis window.

### Step 4: Find any code

Usually it is enough to go to 0x0 or 0x800000 (depending on the firmware), then press `D` (decompilation).

### Step 5: Auto-analyze the firmware

**Full analysis**

1. Open `Analysis -> Auto Analyse 'fullflash.bin'`
2. Make sure the parameters match those specified in **Step 3**
3. Click **ANALYSE**

This will take 10-30 minutes. The process is long, so be patient.

**Run only once**

1. Select `Analysis -> One-shot -> Create Address Tables`

### Congratulations, you did it! ✨

We are waiting for your patches in the patch database at <a href="https://patches.kibab.com">patches.kibab.com</a> :)
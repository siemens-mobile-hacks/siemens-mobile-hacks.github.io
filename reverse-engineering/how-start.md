# How reverse engineering Siemens in the 2k24?
Prerequisites:
1. Installed the latest version of **Ghidra SRE**.
2. Fullflash for the Siemens SGOLD/NewSGOLD phone.
3. RAM mmeory dump (8 or 16 Mb from 0xA8000000).

# Open fullflash in the Ghidra
1. Run the disassembler and click `File` -> `Import File`
2. Select your fullflash.bin
3. Select the appropriate disassembler settings:
    - Format: `Raw Binary`
    - Language: `ARM v5t 32 little`
    - Options -> Block Name: `FULLFLASH`
    - Options -> Base Address: `A0000000`
  
    ![Open options](img/open-options.png)
    
    ![Open options](img/open-options2.png)
4. Then click on `fullflash.bin` in the project files.
5. Reject analyzing (press "No").

   ![No analyze](img/no-analyze.png)

# Define IO memory region
1. Click `Window` -> `Memory Map`
2. Add new memory region with given settings:
   - Block Name: `IO`
   - Start Addr: `0xF0000000`
   - Length: `0x0F000000`
   - Attributes: `Read + Write + Volatile`
   - Uninitialized

    ![Open options](img/io-memory-region.png)

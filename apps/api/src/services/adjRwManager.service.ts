import * as fs from 'fs';
import * as path from 'path';

interface MdcRecord {
  CODE: string;
  MDC: number;
  // Add other fields from MDC.csv if needed
}

interface AdjRwRecord {
  DRG: number;
  RW: number;
  RW0D: number;
  WTLOS: number;
  OT: number;
  MDF: number;
  // Add other fields from Adj_rw.csv if needed
}

// Represents the structure: { "SymptomCode": { "DRG4Digit": DCL_Value } }
type DclData = Record<string, Record<string, number>>;


class AdjManager {

  /**
 * A simple CSV parser to convert CSV text to an array of objects.
 * @param csvText The raw string content of the CSV file.
 * @returns An array of objects representing the CSV rows.
 */
  parseCsv<T>(csvText: string): T[] {
    const lines = csvText.trim().split('\n');
    const header = lines[0].split(',').map(h => h.trim());
    const data: T[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const entry: any = {};
      header.forEach((col, index) => {
        const value = values[index];
        // Attempt to convert to number if it looks like one, otherwise keep as string
        entry[col] = !isNaN(Number(value)) ? Number(value) : value;
      });
      data.push(entry as T);
    }
    return data;
  }


  /**
   * Loads all necessary reference files from the filesystem.
   * @returns A tuple containing the loaded data.
   */
  loadReferenceData(): [MdcRecord[], AdjRwRecord[], DclData] | [null, null, null] {
    try {
      console.log(__dirname);

      const mdcCsv = fs.readFileSync(path.join(__dirname, '../asset/adjrw/MDC.csv'), 'utf-8');
      const adjRwCsv = fs.readFileSync(path.join(__dirname, '../asset/adjrw/Adj_rw.csv'), 'utf-8');
      const dclJson = fs.readFileSync(path.join(__dirname, '../asset/adjrw/DRG_DCL_Table_Output_Summary.json'), 'utf-8');

      const mdcDf = this.parseCsv<MdcRecord>(mdcCsv);
      const adjRwDf = this.parseCsv<AdjRwRecord>(adjRwCsv);
      const dclData: DclData = JSON.parse(dclJson);

      console.log("✅ All reference files loaded successfully.");
      return [mdcDf, adjRwDf, dclData];
    } catch (error: any) {
      console.error("❌ ERROR: A required file was not found. Please check your files.");
      console.error(`Details: ${error.message}`);
      return [null, null, null];
    }
  }

  /**
 * Determines the 4-digit DRG code from the principal diagnosis (pdx).
 * This function is a mock-up and needs to be replaced with the full complex logic.
 */
  getDrg4Digit(
    mdcDf: MdcRecord[],
    pdx: string,
    sdx: string[],
    proc: string[],
    gender: number,
    age: number
  ): string | null {
    // 3.1: Find MDC from the principal diagnosis (pdx)
    const mdcRecord = mdcDf.find(record => record.CODE === pdx);

    if (!mdcRecord) {
      console.warn(`⚠️ Warning: PDX '${pdx}' not found in MDC reference table. Cannot determine MDC.`);
      return null;
    }
    const mdc = mdcRecord.MDC;
    console.log(`Input PDX = '${pdx}' maps to MDC = ${mdc}`);

    // 3.2: Determine DRG based on MDC (mock logic)
    switch (mdc) {
      case 5: return '0555';
      case 4: return '0452';
      case 11: return '1159';
      default: return null;
    }
  }

  /**
 * Calculates the Patient Clinical Complexity Level (PCL) score.
 */
  calculatePclScore(pdx: string, sdx: string[], drg4digit: string, dclData: DclData): number {
    // Combine principal and secondary diagnoses
    const allDiagnoses = [pdx, ...sdx];
    console.log(`\nAll diagnoses for PCL calculation: ${allDiagnoses.join(', ')}`);

    // Step 4 & 5: Find DCL for each diagnosis and create a map
    const pclMap = new Map<string, number>();
    allDiagnoses.forEach(code => {
      const dclValue = dclData[code]?.[drg4digit] ?? 0;
      pclMap.set(code, dclValue);
    });

    console.log("Unsorted DCL values:", Object.fromEntries(pclMap));

    // Sort the entries by DCL (descending) and then by code (alphanumeric ascending)
    const sortedEntries = [...pclMap.entries()].sort((a, b) => {
      // a is [code, dcl], b is [code, dcl]
      if (a[1] > b[1]) return -1; // Sort by DCL descending
      if (a[1] < b[1]) return 1;
      if (a[0] < b[0]) return -1; // Then by code ascending
      if (a[0] > b[0]) return 1;
      return 0;
    });

    console.log("Sorted DCL values for calculation:", Object.fromEntries(new Map(sortedEntries)));

    // Step 6: Calculate the final PCL score
    let pclScore = 0;
    sortedEntries.forEach(([code, dcl], index) => {
      pclScore += dcl * (0.82 ** index);
    });

    return pclScore;
  }

  /**
   * Determines the 5th digit of the DRG based on the PCL score.
   */
  getFinalDrg(drg4digit: string, pclScore: number): string {
    // TODO: This mock process get from realistic
    const fifthDrgTable: Record<string, Record<string, string>> = {
      '0555': { '2': '0', '4': '1', '6': '2', '8': '3', '9': '4' },
      '0452': { '1': '0', '3': '1', '5': '2', '7': '3', '9': '4' },
      '1159': { '3': '0', '5': '1', '6': '2', '9': '3' },
    };

    const rules = fifthDrgTable[drg4digit];
    if (!rules) {
      console.warn(`⚠️ Warning: No 5th digit rule found for DRG '${drg4digit}'.`);
      return `${drg4digit}?`;
    }

    // Sort thresholds numerically
    const thresholds = Object.entries(rules)
      .map(([threshold, digit]): [number, string] => [parseInt(threshold, 10), digit])
      .sort((a, b) => a[0] - b[0]) as [number, string][];

    for (const [threshold, fifthDigit] of thresholds) {
      if (pclScore <= threshold) {
        return drg4digit + fifthDigit;
      }
    }

    // If score is higher than all thresholds, return the highest grade
    return thresholds.length > 0 ? drg4digit + thresholds[thresholds.length - 1][1] : `${drg4digit}?`;
  }

  calculateAdjRw(drg: string, adjRwDf: AdjRwRecord[], los: number): string {
    console.log("\n" + "=".repeat(40));
    console.log("STEP 08: Adjusted RW (AdjRw) Calculation");
    console.log("=".repeat(40));
    console.log("⚠️ SKIPPED: This calculation is incomplete because 'rw_index.json' is missing.");

    // --- The following logic should be implemented once rw_index.json is available ---

    // const drgNum = parseInt(drg, 10);
    // const drgParams = adjRwDf.find(record => record.DRG === drgNum);
    //
    // if (!drgParams) {
    //     console.error(`DRG '${drg}' not found in Adj_rw table.`);
    //     return "Error: DRG not found";
    // }
    //
    // const { RW: rw, RW0D: rw0d, WTLOS: wtlos, OT: ot, MDF: of } = drgParams;
    //
    // // ... load rw_index.json and get b12, b23 values ...
    //
    // let adjRw = 0;
    // if (los < wtlos) {
    //     adjRw = rw0d + los * (rw - rw0d) / Math.ceil(wtlos / 3);
    // } else {
    //     // ... logic for long stay cases ...
    // }

    return "Calculation Skipped";
  }

}

export default new AdjManager();
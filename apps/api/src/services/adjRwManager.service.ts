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
  DRGNAME: string;
  // Add other fields from Adj_rw.csv if needed
}

interface RwIndex {
  Type: string;
  DRG: string;
  Range: number;
  b12: number;
  b23: number;
}

// Represents the structure: { "SymptomCode": { "DRG4Digit": DCL_Value } }
type DclData = Record<string, Record<string, number>>;


class AdjManager {

  _mdcDf: MdcRecord[] = [];
  _adjRwDf: AdjRwRecord[] = [];
  _dclData: DclData = {};
  _rwIndexData: RwIndex[] = [];

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
  loadReferenceData(): [MdcRecord[], AdjRwRecord[], DclData, RwIndex[]] | [null, null, null, null] {
    try {
      console.log(__dirname);

      const mdcCsv = fs.readFileSync(path.join(__dirname, '../asset/adjrw/MDC.csv'), 'utf-8');
      const adjRwCsv = fs.readFileSync(path.join(__dirname, '../asset/adjrw/Adj_rw.csv'), 'utf-8');
      const dclJson = fs.readFileSync(path.join(__dirname, '../asset/adjrw/DRG_DCL_Table_Output_Summary.json'), 'utf-8');
      const rwIndex = fs.readFileSync(path.join(__dirname, '../asset/adjrw/rwIndex.json'), 'utf-8');

      const mdcDf = this.parseCsv<MdcRecord>(mdcCsv);
      const adjRwDf = this.parseCsv<AdjRwRecord>(adjRwCsv);
      const dclData: DclData = JSON.parse(dclJson);
      const rwIndexData: RwIndex[] = JSON.parse(rwIndex);

      this._adjRwDf = adjRwDf;
      this._mdcDf = mdcDf;
      this._dclData = dclData;
      this._rwIndexData = rwIndexData;

      console.log("✅ All reference files loaded successfully.");
      return [mdcDf, adjRwDf, dclData, rwIndexData];
    } catch (error: any) {
      console.error("❌ ERROR: A required file was not found. Please check your files.");
      console.error(`Details: ${error.message}`);
      return [null, null, null, null];
    }
  }

  /**
 * Determines the 4-digit DRG code from the principal diagnosis (pdx).
 * This function is a mock-up and needs to be replaced with the full complex logic.
 */
  getDrg4Digit(
    pdx: string,
    sdx: string[],
    proc: string[],
    gender: number,
    age: number
  ): string | null {
    // 3.1: Find MDC from the principal diagnosis (pdx)
    const mdcRecord = this._mdcDf.find(record => record.CODE === pdx);

    if (!mdcRecord) {
      console.warn(`⚠️ Warning: PDX '${pdx}' not found in MDC reference table. Cannot determine MDC.`);
      return null;
    }
    const mdc = mdcRecord.MDC;
    // console.log(`Input PDX = '${pdx}' maps to MDC = ${mdc}`);

    // 3.2: Determine DRG based on MDC (mock logic)
    switch (mdc) {
      case 5: return '0555';
      case 4: return '0452';
      case 11: return '1158';
      default: return null;
    }
  }

  /**
 * Calculates the Patient Clinical Complexity Level (PCL) score.
 */
  calculatePclScore(pdx: string, sdx: string[], drg4digit: string): number {
    // Combine principal and secondary diagnoses
    const allDiagnoses = [pdx, ...sdx];
    // console.log(`\nAll diagnoses for PCL calculation: ${allDiagnoses.join(', ')}`);

    // Step 4 & 5: Find DCL for each diagnosis and create a map
    const pclMap = new Map<string, number>();
    allDiagnoses.forEach(code => {
      const dclValue = this._dclData[code]?.[drg4digit] ?? 0;
      pclMap.set(code, dclValue);
    });

    // console.log("Unsorted DCL values:", Object.fromEntries(pclMap));

    // Sort the entries by DCL (descending) and then by code (alphanumeric ascending)
    const sortedEntries = [...pclMap.entries()].sort((a, b) => {
      // a is [code, dcl], b is [code, dcl]
      if (a[1] > b[1]) return -1; // Sort by DCL descending
      if (a[1] < b[1]) return 1;
      if (a[0] < b[0]) return -1; // Then by code ascending
      if (a[0] > b[0]) return 1;
      return 0;
    });

    // console.log("Sorted DCL values for calculation:", Object.fromEntries(new Map(sortedEntries)));

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
      '1158': { '3': '0', '5': '1', '6': '2', '9': '3' },
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



  b_index(procedure: string, threshold: number): [number, number] | [null, null] {
    const filtered = this._rwIndexData.filter((item) => item.DRG === procedure);
    for (let i = 0; i < filtered.length; i++) {
      if (threshold < filtered[i].Range) {
        return [filtered[i].b12, filtered[i].b23];
      }
    }
    return [null, null]; // Or throw an error if no match is found
  }

  /**
  * Calculates the Adjusted Relative Weight (AdjRw) based on Length of Stay (LOS).
  *
  * @param LOS - Length of Stay (days).
  * @param OT - Outlier Threshold (days).
  * @param Rw - Relative Weight for the DRG.
  * @param OF - Outlier Factor.
  * @param b12 - Costing coefficient for stays between 1x and 2x OT.
  * @param b23 - Costing coefficient for stays over 3x OT.
  * @param Rw0d - Relative Weight for a zero-day stay.
  * @param WtLOS - Weighted Length of Stay for the DRG.
  * @returns The calculated adjusted relative weight.
  */
  calculateAdjRw(
    {
      LOS,
      OT,
      Rw,
      OF,
      b12,
      b23,
      Rw0d,
      WtLOS
    }: {
      LOS: number,
      OT: number,
      Rw: number,
      OF: number,
      b12: number,
      b23: number,
      Rw0d: number,
      WtLOS: number
    }
  ): number {
    console.log(`Patient LOS is: ${LOS}\nPatient OT is: ${OT}`);

    let adjRw = 0; // Initialize adjRw

    if (LOS < WtLOS) {
      // This condition is often for short stays
      adjRw = Rw0d + (LOS * (Rw - Rw0d)) / Math.ceil(WtLOS / 3);
      console.log(`Condition: Short Stay (LOS < WtLOS: ${LOS} < ${WtLOS})`);
    } else if (LOS >= OT && LOS < 2 * OT) {
      adjRw = Rw + OF * b12 * (LOS - OT);
      console.log(`Condition: OT <= LOS < 2*OT (${OT} <= ${LOS} < ${2 * OT})`);
    } else if (LOS >= 2 * OT && LOS < 3 * OT) {
      adjRw = Rw + OF * b12 * OT + OF * b12 * (LOS - 2 * OT);
      console.log(`Condition: 2*OT <= LOS < 3*OT (${2 * OT} <= ${LOS} < ${3 * OT})`);
    } else {
      // This covers LOS >= 3*OT
      adjRw = Rw + OF * OT * (b12 + b23);
      console.log(`Condition: LOS >= 3*OT (${LOS} >= ${3 * OT})`);
    }

    // console.log(`Final AdjRw = ${adjRw.toFixed(4)}`);
    return adjRw;
  }

  getDRGIndex(finalDrg: string) {
    return this._adjRwDf.find(record => record.DRG === Number(finalDrg));
  }

}

export default AdjManager;
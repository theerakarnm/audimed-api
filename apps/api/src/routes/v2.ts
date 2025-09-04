import { Hono } from "hono";
import AdjRwManagerService from "../services/adjRwManager.service";

const v2Route = new Hono();

v2Route.get('/adjrw', (c) => {
  // --- STEP 01: Load Data ---
  console.log("=".repeat(40));
  console.log("STEP 01: Loading Reference Data");
  console.log("=".repeat(40));
  const [MDC_df, Adj_rw_df, DCL_data, rwIndex] = AdjRwManagerService.loadReferenceData();

  if (!MDC_df || !Adj_rw_df || !DCL_data) {
    console.log("\nHalting execution due to missing files.");
    return c.json({
      success: false,
      error: "Missing reference data files",
      statusCode: 500
    });
  }

  // --- STEP 02: Define Inputs ---
  console.log("\n" + "=".repeat(40));
  console.log("STEP 02: Patient Inputs");
  console.log("=".repeat(40));
  const pdx = 'I500';
  const sdx = ['I10', 'H259', 'S7200', 'E876', 'K250'];
  const proc: string[] = [];
  const gender = 0; // Assuming 0 for Male, 1 for Female
  const age = 20;
  const los = 5; // Length of Stay in days

  console.log(`Principal Diagnosis (PDx): ${pdx}`);
  console.log(`Secondary Diagnoses (SDx): ${sdx.join(', ')}`);
  console.log(`Procedures: ${proc.length > 0 ? proc.join(', ') : 'None'}`);
  console.log(`Age: ${age}, Gender: ${gender}, LOS: ${los}`);

  // --- STEP 03: Get 4-Digit DRG ---
  console.log("\n" + "=".repeat(40));
  console.log("STEP 03: Calculating 4-Digit DRG");
  console.log("=".repeat(40));
  const drg4digit = AdjRwManagerService.getDrg4Digit(MDC_df, pdx, sdx, proc, gender, age);

  if (drg4digit) {
    console.log(`➡️ Calculated 4-Digit DRG: ${drg4digit}`);

    // --- STEPS 04-06: Calculate PCL Score ---
    console.log("\n" + "=".repeat(40));
    console.log("STEPS 04-06: Calculating PCL Score");
    console.log("=".repeat(40));
    const PCL_score = AdjRwManagerService.calculatePclScore(pdx, sdx, drg4digit, DCL_data);
    console.log(`➡️ Calculated PCL Score: ${PCL_score.toFixed(4)}`);

    // --- STEP 07: Get Final 5-Digit DRG ---
    console.log("\n" + "=".repeat(40));
    console.log("STEP 07: Determining Final 5-Digit DRG");
    console.log("=".repeat(40));
    const finalDrg = AdjRwManagerService.getFinalDrg(drg4digit, PCL_score);
    console.log(`➡️ Final 5-Digit DRG: ${finalDrg}`);

    const drgIndex = Adj_rw_df.find(record => record.DRG === Number(finalDrg));

    if (!drgIndex) {
      console.log(`Could not find DRG index for Final DRG '${finalDrg}'. Halting.`);
      throw new Error(`Could not find DRG index for Final DRG '${finalDrg}'`);
    }

    const procedure = 'M'
    const Rw = drgIndex['RW']
    const Rw0d = drgIndex['RW0D']
    const WtLOS = drgIndex['WTLOS']
    const OT = drgIndex['OT']
    const OF = drgIndex['MDF']

    const [b12, b23] = AdjRwManagerService.b_index(procedure, Rw, rwIndex);

    if (!b12 || !b23) {
      console.log(`Could not find bIndex for Procedure '${procedure}' and RW '${Rw}'. Halting.`);
      throw new Error(`Could not find bIndex for Procedure '${procedure}' and RW '${Rw}'`);
    }

    // --- STEP 08: Calculate AdjRw ---
    const adjRwResult = AdjRwManagerService.calculateAdjRw({
      LOS: los,
      OT,
      Rw,
      OF,
      b12,
      b23,
      Rw0d,
      WtLOS
    });
    console.log(`➡️ Adjusted RW: ${adjRwResult}`);

    // --- FINAL SUMMARY ---
    console.log("\n" + "#".repeat(40));
    console.log("            FINAL CALCULATION SUMMARY");
    console.log("#".repeat(40));
    console.log(`  Inputs:`);
    console.log(`    PDx: ${pdx}, SDx: ${sdx.join(', ')}, LOS: ${los}`);
    console.log(`  ----------------------------------------`);
    console.log(`  Results:`);
    console.log(`    4-Digit DRG  : ${drg4digit}`);
    console.log(`    PCL Score    : ${PCL_score.toFixed(4)}`);
    console.log(`    Final DRG    : ${finalDrg}`);
    console.log(`    Adjusted RW  : ${adjRwResult}`);
    console.log("#".repeat(40));

    return c.json({
      success: true,
      data: {
        inputs: {
          PDx: pdx,
          SDx: sdx,
          LOS: los
        },
        results: {
          "4-Digit DRG": drg4digit,
          "PCL Score": PCL_score.toFixed(4),
          "Final DRG": finalDrg,
          "Adjusted RW": adjRwResult
        }
      }
    });

  } else {
    console.log(`Could not determine DRG for PDx '${pdx}'. Halting.`);

    return c.json({
      success: false,
      error: `Could not determine DRG for PDx '${pdx}'`,
      statusCode: 500
    });
  }
});

export default v2Route;
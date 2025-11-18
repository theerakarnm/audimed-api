import { Hono } from "hono";
import AdjRwManager from "../services/adjRwManager.service";
import { OptimizationService } from "../services/optimization.service";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const v2Route = new Hono();

v2Route.post('/adjrw',
  zValidator('json', z.object({
    items: z.array(z.string()),
    gender: z.enum(['male', 'female']),
    age: z.number().min(0),
    lengthOfStay: z.number()
  })),
  (c) => {
    const { items, gender: genderText, age, lengthOfStay } = c.req.valid('json')
    const proc: string[] = [];
    const gender = genderText === 'male' ? 0 : 1; // Assuming 0 for Male, 1 for Female
    const los = lengthOfStay; // Length of Stay in days

    const n = items.length;
    const sdxCapacity = Math.min(12, n - 1);
    const pdxCapacity = 1;
    const totalItemsToSelect = sdxCapacity + pdxCapacity;

    if (n < totalItemsToSelect) {
      throw new Error(`ต้องการไอเท็มอย่างน้อย ${totalItemsToSelect} ชิ้น แต่มีเพียง ${n} ชิ้น`);
    }

    let adjRw = -Infinity;
    let bestSetup: {
      pdx: string | null;
      sdx: string[];
      drgName: string;
    } = { pdx: null, sdx: [], drgName: '' };

    const optimizeService = new OptimizationService()
    const AdjRwManagerService = new AdjRwManager();

    AdjRwManagerService.loadReferenceData();

    const all13ItemCombinations = optimizeService.getCombinations(items, totalItemsToSelect);

    console.log(all13ItemCombinations);


    for (const currentGroup of all13ItemCombinations) {
      for (let i = 0; i < currentGroup.length; i++) {
        const pdx = currentGroup[i];
        const sdx = currentGroup.filter((_, index) => index !== i);

        const drg4digit = AdjRwManagerService.getDrg4Digit(pdx, sdx, proc, gender, age);

        if (drg4digit) {
          const PCL_score = AdjRwManagerService.calculatePclScore(pdx, sdx, drg4digit);
          const finalDrg = AdjRwManagerService.getFinalDrg(drg4digit, PCL_score);
          const drgIndex = AdjRwManagerService.getDRGIndex(finalDrg);

          if (!drgIndex) {
            console.log(`Could not find DRG index for Final DRG '${finalDrg}'. Halting.`);
            return c.json({
              adjRw: null,
              bestSetup: null,
              error: `Could not find DRG index for Final DRG '${finalDrg}'. Halting.`
            })
          }

          const procedure = 'M'
          const Rw = drgIndex['RW']
          const Rw0d = drgIndex['RW0D']
          const WtLOS = drgIndex['WTLOS']
          const OT = drgIndex['OT']
          const OF = drgIndex['MDF']
          const drgName = drgIndex['DRGNAME']

          const [b12, b23] = AdjRwManagerService.b_index(procedure, Rw);

          if (!b12 || !b23) {
            console.log(`Could not find bIndex for Procedure '${procedure}' and RW '${Rw}'. Halting.`);
            return c.json({
              adjRw: null,
              bestSetup: null,
              error: `Could not find bIndex for Procedure '${procedure}' and RW '${Rw}'`
            })
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

          console.log({
            pdx, sdx, drg4digit, PCL_score, finalDrg, drgIndex, adjRwResult
          });

          // 5. หากค่าที่ได้สูงกว่าค่าสูงสุดที่เคยบันทึกไว้ ให้อัปเดต
          if (adjRwResult > adjRw) {
            adjRw = adjRwResult;
            bestSetup = { pdx, sdx, drgName };
          }
        };

      }
    }

    return c.json({ adjRw, bestSetup, drgName: '', error: null })

  });

v2Route.get('/adjrw-old', (c) => {
  // --- STEP 01: Load Data ---
  const AdjRwManagerService = new AdjRwManager();

  console.log("=".repeat(40));
  console.log("STEP 01: Loading Reference Data");
  console.log("=".repeat(40));
  AdjRwManagerService.loadReferenceData();

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
  const drg4digit = AdjRwManagerService.getDrg4Digit(pdx, sdx, proc, gender, age);

  if (drg4digit) {
    console.log(`➡️ Calculated 4-Digit DRG: ${drg4digit}`);

    // --- STEPS 04-06: Calculate PCL Score ---
    console.log("\n" + "=".repeat(40));
    console.log("STEPS 04-06: Calculating PCL Score");
    console.log("=".repeat(40));
    const PCL_score = AdjRwManagerService.calculatePclScore(pdx, sdx, drg4digit);
    console.log(`➡️ Calculated PCL Score: ${PCL_score.toFixed(4)}`);

    // --- STEP 07: Get Final 5-Digit DRG ---
    console.log("\n" + "=".repeat(40));
    console.log("STEP 07: Determining Final 5-Digit DRG");
    console.log("=".repeat(40));
    const finalDrg = AdjRwManagerService.getFinalDrg(drg4digit, PCL_score);
    console.log(`➡️ Final 5-Digit DRG: ${finalDrg}`);

    const drgIndex = AdjRwManagerService.getDRGIndex(finalDrg);

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

    const [b12, b23] = AdjRwManagerService.b_index(procedure, Rw);

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
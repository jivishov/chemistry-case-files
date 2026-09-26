export default {
  "number": 1,
  "title": "Practices, Measurement & Matter",
  "question": "How can a measurement become trustworthy evidence?",
  "intro": "A chemistry investigation begins before a calculation. You must decide what you are observing, select a suitable tool, record its units, and judge how much confidence the result deserves. These habits connect a small aquarium investigation to the navigation of a spacecraft.",
  "sections": [
    {
      "id": "matter",
      "title": "Matter, models, and evidence",
      "objective": "Distinguish substances, mixtures, and physical or chemical changes; separate an observation from an explanation.",
      "body": "<p><strong>Matter</strong> has mass and occupies space. An element contains one kind of atom. A compound contains elements chemically combined in a fixed ratio. A mixture contains substances in variable proportions: salt water is homogeneous at the scale we observe, whereas sand in water is heterogeneous. Filtration separates suspended solids; evaporation can recover a dissolved solid. These methods use physical properties.</p><p>A physical change preserves chemical identity, as when ice melts. A chemical change produces different substances. Bubbles, color changes, or temperature changes can be evidence, but none alone proves a reaction: boiling water also bubbles. Record what you see before explaining it. A useful investigation changes one relevant variable while controlling others, repeats measurements, and compares the result with a reference. Follow the teacher’s procedure and use the specified protective equipment; the aquarium missions are classroom models, not instructions for treating real animals.</p>",
      "simple": "First describe what happened. Then use evidence to explain why it happened.",
      "analogy": "An observation is like a photograph; an explanation is the caption you must justify. A caption can be wrong even when the photograph is accurate.",
      "example": "“A solid remained on the filter” is an observation. “The sample contains an insoluble component” is an inference supported by that observation, assuming the filter and procedure worked properly.",
      "sources": [
        "2.2",
        "2.7",
        "2.10",
        "2.14"
      ],
      "teks": [
        "C.1(G)",
        "C.1(H)"
      ]
    },
    {
      "id": "measure",
      "title": "A number needs a unit",
      "objective": "Read a graduated cylinder and convert quantities using units that cancel.",
      "body": "<p>A measurement combines a numerical value with a unit. The SI base units include the meter for length, kilogram for mass, second for time, kelvin for temperature, and mole for amount of substance. Chemistry also commonly uses grams, liters, and milliliters. One liter is 1,000 mL; 1 mL occupies the same volume as 1 cm³. Prefixes describe powers of ten: kilo means 10³, centi means 10⁻², and milli means 10⁻³.</p><p>Read a clear, water-like liquid at the bottom of its curved <strong>meniscus</strong>, with your eye level with the liquid. Looking from above or below introduces parallax. On an analog scale, record the marked digits plus one estimated digit. With 1 mL divisions, a reading such as 26.4 mL is appropriate. A digital instrument is different: record its displayed resolution instead of inventing another digit.</p><p><strong>Dimensional analysis</strong> uses equivalent quantities arranged as a fraction. Position the old unit so it cancels. The conversion changes the numerical representation, not the physical amount. Check the direction: a quantity expressed in smaller units usually has a larger number.</p>",
      "simple": "Units are part of the measurement. Read carefully, then convert by multiplying by a ratio equal to one.",
      "analogy": "Changing centimeters to meters resembles exchanging coins for bills: the number of pieces changes while the total value stays the same.",
      "example": "Convert 350 mL to liters (three significant figures intended):<eq>350 mL × (1 L / 1,000 mL) = 0.350 L</eq>The mL units cancel. A second conversion is:<eq>2.0 lbf·s × (4.45 N·s / 1 lbf·s) ≈ 8.9 N·s</eq>Simply relabeling 2.0 would change the meaning.",
      "sources": [
        "3.1",
        "3.2",
        "3.8",
        "3.14",
        "nasa-mars"
      ],
      "teks": [
        "C.1(D)",
        "C.1(E)"
      ]
    },
    {
      "id": "sigfig",
      "title": "Report the precision you actually have",
      "objective": "Count significant figures and round measurements and calculated results appropriately.",
      "body": "<p><strong>Significant figures</strong> communicate the resolution of a measurement. Nonzero digits count; zeros between them count; leading zeros do not. Trailing zeros after a decimal point count. Thus 0.00450 has three significant figures, while 20.04 has four. A whole number such as 1500 can be ambiguous; 1.50 × 10³ explicitly has three significant figures. Exact counts and defined conversions do not limit precision.</p><p>For multiplication or division, round the final result to the fewest significant figures among measured inputs. For addition or subtraction, round to the least precise decimal place. Keep extra digits during intermediate calculations and round once at the end. Digits on a calculator are not additional experimental evidence.</p>",
      "simple": "Do not report more detail than your tools can support.",
      "analogy": "An enlarged photograph contains more pixels on your screen, but enlargement does not recover detail that the camera never captured.",
      "example": "Addition is limited by the decimal place:<eq>12.11 mL + 0.3 mL = 12.41 mL → 12.4 mL</eq>Division is limited by significant figures:<eq>2.4 g ÷ 1.12 mL = 2.142857… g/mL → 2.1 g/mL</eq>The mass has two significant figures.",
      "sources": [
        "3.16",
        "3.17",
        "3.18"
      ],
      "teks": [
        "C.2(C)"
      ]
    },
    {
      "id": "density",
      "title": "Use density to support an identification",
      "objective": "Calculate density from displacement and compare it with reference data.",
      "body": "<p><strong>Density</strong> is mass per unit volume. A fully submerged, nonporous object displaces its own volume if it neither dissolves nor reacts:</p><eq>ρ = m/V</eq><eq>V = V<sub>after</sub> − V<sub>before</sub></eq><p>Read both menisci consistently. Bubbles, incomplete submersion, and water loss introduce error. Density is intensive: halving a uniform sample halves mass and volume, preserving their ratio. A reference-table match supports identification but cannot prove identity, compatibility, or toxicity. Use the mission’s supplied material information.</p><p>For the water-change case, replace a fraction f of well-mixed water. With equal final volume and no other sources or reactions:</p><eq>C<sub>final</sub> = C<sub>initial</sub>(1 − f) + C<sub>replacement</sub>f</eq><p>If replacement water contains none of the tracked substance, its contribution is zero.</p>",
      "simple": "Divide mass by the space the sample occupies. Replacing part of a well-mixed solution also removes that fraction of its dissolved material.",
      "analogy": "People per classroom illustrates a ratio: doubling both people and space leaves crowding unchanged. This does not describe atomic packing in detail.",
      "example": "A 54.0 g object raises water from 20.0 to 40.0 mL:<eq>V = 40.0 − 20.0 = 20.0 mL</eq><eq>ρ = 54.0 g / 20.0 mL = 2.70 g/mL</eq>Separately, replace 25% of a 1.20 mg/L solution with substance-free water:<eq>C_final = 1.20 × 0.75 = 0.900 mg/L</eq>",
      "sources": [
        "3.11",
        "2.4",
        "3.17"
      ],
      "teks": [
        "C.2(C)",
        "C.3(A)"
      ]
    },
    {
      "id": "evaluate",
      "title": "Accuracy, precision, and an evidence-based decision",
      "objective": "Evaluate repeated measurements using their mean, spread, percent error, and possible bias.",
      "body": "<p><strong>Accuracy</strong> is agreement with a reference; <strong>precision</strong> is agreement among repeated measurements. A balance adding 0.20 g every time introduces systematic bias. Variable handling or reading errors produce scatter. Repeating trials estimates scatter but does not automatically remove bias.</p><p>Calculate the mean and compare it with a nonzero accepted reference:</p><eq>Mean = sum of readings / number of readings</eq><eq>Percent error = |measured − accepted|/|accepted| × 100%</eq><p>Retain units until they cancel. To justify a decision, state a claim, cite measurements, and explain their chemical relevance. Include uncertainty when it could change the decision.</p>",
      "simple": "Measurements should cluster together and agree with a trustworthy reference.",
      "analogy": "A clock that is always seven minutes fast is consistent but inaccurate. Averaging its readings will not repair its setting.",
      "example": "For 9.8, 10.0, and 10.2 mL:<eq>Mean = (9.8 + 10.0 + 10.2)/3 = 10.0 mL</eq>Compare with a 10.5 mL reference:<eq>Percent error = |10.0 − 10.5|/10.5 × 100% ≈ 4.8%</eq>The mean alone does not describe the 0.4 mL spread.",
      "sources": [
        "3.12",
        "3.13"
      ],
      "teks": [
        "C.2(B)",
        "C.4(A)"
      ]
    }
  ],
  "visual": {
    "title": "Watch displacement reveal volume",
    "instruction": "Predict what happens to the final water level as the volume of a fully submerged object increases. Move the slider, or play the guided animation.",
    "observe": "The starting level stays at 20.0 mL. The rise equals the object’s volume. Here the material’s density is fixed at 2.70 g/mL, so mass changes with volume.",
    "challenge": "Compare a 10.0 mL and a 20.0 mL sample. Which quantities double, and which stay constant?",
    "explanation": "Volume and mass both double; density stays 2.70 g/mL. This model assumes a nonporous solid with no bubbles, dissolution, or reaction."
  },
  "honors": [
    {
      "id": "uncertainty",
      "title": "Can these metals really be distinguished?",
      "mode": "density",
      "body": "For small measurement bounds, the mission uses a first-order worst-case estimate:<eq>δρ/ρ ≈ δm/m + δV/V</eq>Add the two displacement reading bounds for δV. This is not a combination of independent statistical standard deviations. For 54.0 ± 0.1 g and 20.0 ± 0.2 mL, relative uncertainty is about 1.19%. Exact endpoints under those bounds are:<eq>ρ_min = 53.9/20.2 ≈ 2.668 g/mL</eq><eq>ρ_max = 54.1/19.8 ≈ 2.732 g/mL</eq>Divide minimum mass by maximum volume for the lower endpoint; reverse them for the upper endpoint.",
      "question": "Why can a larger sample help distinguish two similar densities?",
      "answer": "If absolute tool uncertainty stays similar, larger mass and displacement reduce relative uncertainty. If candidate density intervals still overlap, report that the identification is not resolved.",
      "sources": [
        "3.14",
        "lib-uncertainty"
      ],
      "teks": [
        "C.2(B)",
        "C.2(C)"
      ]
    },
    {
      "id": "spread",
      "title": "How much do repeated readings vary?",
      "mode": "evaluate",
      "body": "For at least two readings, sample standard deviation is:<eq>s = √[Σ(xᵢ − x̄)²/(n − 1)]</eq>Subtract the mean, square the differences, sum, divide by n − 1, then take the square root. The result has the same units as the readings. For 9.8, 10.0, and 10.2 mL:<eq>s = 0.20 mL</eq>",
      "question": "Can a small standard deviation prove accuracy?",
      "answer": "No. It describes scatter, not bias. A calibration error can shift every result together. Compare the mean with a reference as well.",
      "sources": [
        "3.12",
        "3.14",
        "nist-spread"
      ],
      "teks": [
        "C.2(B)"
      ]
    }
  ],
  "checks": [
    {
      "question": "A cylinder has marks every 1 mL. Which reading communicates an appropriate estimate?",
      "options": [
        "26 mL",
        "26.4 mL",
        "26.4321 mL"
      ],
      "answer": 1,
      "why": "Estimate one digit beyond the analog marks, to 0.1 mL.",
      "section": "measure"
    },
    {
      "question": "Three readings agree closely but all exceed the reference. What should you investigate?",
      "options": [
        "A possible systematic error",
        "Whether averaging will necessarily remove the bias",
        "Whether units can be omitted"
      ],
      "answer": 0,
      "why": "Good repeatability does not rule out a calibration or method error.",
      "section": "evaluate"
    }
  ],
  "assessment": [
    [
      "measure",
      "Read the tool",
      [
        "measure"
      ],
      "Read a meniscus and record the correct units."
    ],
    [
      "sigfig",
      "Significant figures",
      [
        "sigfig"
      ],
      "Count, round, and calculate using measurement precision."
    ],
    [
      "density",
      "Density lab",
      [
        "density"
      ],
      "Use displacement, identify a sample, and apply the supplied scenario rule."
    ],
    [
      "evaluate",
      "Accuracy vs precision",
      [
        "evaluate"
      ],
      "Judge a dataset from its center and spread."
    ],
    [
      "capstone",
      "The water change",
      [
        "measure",
        "density",
        "evaluate"
      ],
      "Calculate a replacement fraction and support the decision with the tank data."
    ],
    [
      "casefile",
      "Mars Climate Orbiter",
      [
        "measure",
        "evaluate"
      ],
      "Explain how an unconverted impulse value creates a systematic navigation error."
    ]
  ],
  "caseNote": "The spacecraft case assesses conversion factors and systematic error. Compare the value recorded with the correctly converted value; a matching numeral is not evidence that two measurements mean the same thing.",
  "glossary": [
    [
      "Matter",
      "Anything with mass and volume."
    ],
    [
      "Substance",
      "Matter with a defined composition, such as an element or compound."
    ],
    [
      "Mixture",
      "Substances combined in variable proportions."
    ],
    [
      "Meniscus",
      "The curved surface of a liquid."
    ],
    [
      "Significant figures",
      "Digits that express the precision of a measured quantity."
    ],
    [
      "Density",
      "Mass divided by volume."
    ],
    [
      "Accuracy",
      "Agreement with an accepted reference."
    ],
    [
      "Precision",
      "Agreement among repeated measurements."
    ],
    [
      "Systematic error",
      "A consistent bias caused by an instrument or method."
    ],
    [
      "Uncertainty",
      "A quantified or described limit on confidence in a measurement."
    ],
    [
      "Mean",
      "The sum of values divided by their count."
    ],
    [
      "Standard deviation",
      "A measure of the spread of a dataset."
    ]
  ],
  "skills": {
    "a": [
      "matter",
      "measure"
    ],
    "b": [
      "sigfig"
    ],
    "c": [
      "density"
    ],
    "d": [
      "evaluate"
    ],
    "h1": [
      "honors-uncertainty"
    ],
    "h2": [
      "honors-spread"
    ],
    "cap": [
      "measure",
      "density",
      "evaluate"
    ]
  }
};

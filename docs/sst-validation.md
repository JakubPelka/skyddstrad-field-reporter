# SST validation

The app performs a simple field validation before `Spara utkast`.

It does **not** validate tree age, because age is difficult to verify reliably in field use.

Current accepted field-checkable criteria:

1. **Jätteträd**  
   Stem diameter greater than 100 cm.  
   In the app this is approximated as stem circumference greater than about 314 cm.

2. **Grovt hålträd**  
   Stem diameter greater than 40 cm and developed cavity in the main stem.  
   In the app this is approximated as stem circumference greater than about 126 cm and `Hålstadium` other than `Inga hål synliga`.

If neither condition is met, the app blocks saving the draft.

This validation is intentionally conservative and should be reviewed after testing against Artportalen and field routines.

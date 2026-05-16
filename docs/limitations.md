# Limitations

## Not official

This is not an official SLU, ArtDatabanken, Artportalen or Länsstyrelsen application.

## No direct upload

The MVP does not upload records directly to Artportalen.

Direct upload would require official access, authentication, confirmed API workflow and clear responsibility for submitted data.

## Placeholder values

The current value lists are draft placeholders.

They must be verified against the official *Skyddsvärda träd* project/import structure before real use.

## Sample existing-tree data

The current map layer uses local sample GeoJSON data.

It does not represent real records.

## GPS accuracy

Mobile GPS can be inaccurate, especially:

- under tree canopy,
- close to buildings,
- in valleys,
- in poor satellite conditions.

The app should show GPS accuracy and allow manual point adjustment.

## Duplicate detection

Duplicate detection is based on distance only.

A nearby point may represent another tree. Missing nearby points do not guarantee that a tree is new.

## Privacy

Local draft data remains in the current browser storage until exported or cleared.

If photos, observers, accounts or central storage are added later, privacy and retention rules must be reviewed.

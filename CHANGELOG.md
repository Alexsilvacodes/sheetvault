# Changelog

## [Unreleased] - Template v2.6

### Character Sheet Editor

#### XP System
- Fixed action upgrade cost formula: level >0 costs `currentRating + 1`; level 0 costs `actionsWithDots + 1` (number of actions in that attribute with at least 1 dot, plus 1)
- Removed duplicate XP trigger from Actions section (already shown in End of Session XP)
- Added End of Session XP section with playbook-specific XP trigger and questions

#### Friends & Rivals
- Removed predefined friends/rivals from playbook data; contacts are now fully custom
- Fixed duplicate friend/rival rendering bug by using index-based keys

#### Stash & Lifestyle
- Redesigned stash as 4 rows of 10 boxes with a lifestyle checkbox per row that auto-fills when the row is complete

#### Items & Load
- Items with weight 0 are now displayed in italics
- Added item descriptions shown below each item name
- Added "Amuleto espantaespiritus" (Spiritbane Charm) to shared items (load 0)

#### Special Abilities
- Veteran ability now supports multiple slots with configurable `max` per playbook (standard: 3, Ghost: 4, Hull: 4, Vampire: 6)
- Each veteran slot has a text field to write the chosen ability (except Hull, which uses Frame Characteristics instead)
- Hull's veteran checkboxes are displayed horizontally

### Spirit Playbooks (New)

Added three new spirit playbooks separated into their own optgroup in the playbook selector:

#### Ghost (Fantasma)
- Uses "Drenaje" (Drain) instead of Stress
- Uses "Desolacion" (Desolation) instead of Trauma
- Custom trauma conditions: Caotico, Destructivo, Furioso, Obsesionado, Territorial, Violento
- 4 veteran slots

#### Hull (Cascaron)
- Uses "Drenaje" (Drain) instead of Stress
- Uses "Desgaste" (Wear) instead of Trauma
- Custom trauma conditions: Chispeante, Goteando, Humeante, Inestable, Parcheado, Rechinando
- Frame Characteristics section with 10 traits (Levitacion, Reflejos, Aspecto realista, Patas de arana, Blindaje, Camara interior, Fonografo, Sensores, Proyectores de humo, Pistones y muelles)
- 4 veteran slots (no text fields; uses Frame Characteristics section)

#### Vampire (Vampiro)
- 12 stress boxes (instead of the standard 9)
- Custom trauma conditions: Atormentado, Despiadado, Feroz, Frio, Inestable, Obsesionado, Paranoide, Reservado
- Restrictions section with 5 restrictions (Bestial, Letargo, Repulsion, Vedado, Vinculado)
- 6 veteran slots

### Leech (Sanguijuela) - Alchemicals

- Fixed item names and English mappings to match the source PDF
- Added two Bandolier items (load 1 each, 3 uses)
- Added Alchemicals section with 13 selectable alchemicals: Aceite de flotar, Aceite de atadura, Aceite igneo, Alkahest, Azogue, Bomba de humo, Chispa (droga), Granada, Polvos asfixiantes, Polvos de trance, Veneno de ceguera, Veneno Fuego de Calavera, Veneno paralizante

### Crew Sheet Editor
- Added `aria-label="Toggle"` to all 16 section toggle buttons

### Accessibility
- Added `aria-label="Toggle"` to all icon-only toggle buttons in CharacterSheetEditor and CrewSheetEditor
- Added `aria-label="Back"` to back navigation links in CharacterSheetEditor, CrewSheetEditor, and templates page
- Added `aria-label="Close"` to the close button in ShareDialog

### Image Upload (from previous commit)
- Character and crew profile image upload with client-side crop modal
- Center-crop to square, resize to 512x512, JPEG compression
- Lightbox for full-size image viewing
- Icon buttons for upload/change/remove
- Sheet list thumbnails

### Types & API
- Added to `PlaybookDef`: `stressMax`, `stressLabel`, `stressLabelEn`, `traumaLabel`, `traumaLabelEn`, `traumaConditions`, `frameCharacteristics`, `restrictions`, `alchemicals`, `xpQuestions`, `xpQuestionsEn`
- Added to `AbilityDef`: `max`

### Translations
- Added EN/ES translations for: `lifestyle`, `endOfSessionXp`, `endOfSessionNote`, `alchemicals`, `alchemicalsNote`

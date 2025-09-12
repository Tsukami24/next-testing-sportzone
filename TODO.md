# TODO: Update Frontend for Pesanan Backend Changes

## Backend Changes Summary
- Petugas can update status (not admin)
- Petugas and customer can cancel orders

## Tasks
- [ ] Update comment in src/app/pesanan/page.tsx from "for admin" to "for petugas"
- [ ] Update src/app/pesanan/[id]/page.tsx:
  - [ ] Change isAdmin check to isPetugas for status updates
  - [ ] Change title from "Admin Status Update Section" to "Petugas Status Update Section"
  - [ ] Add cancel button for petugas and customer
  - [ ] Add logic to show cancel button if user is petugas or customer
- [ ] Test the changes by running the app and verifying permissions

## Files to Edit
- src/app/pesanan/page.tsx
- src/app/pesanan/[id]/page.tsx

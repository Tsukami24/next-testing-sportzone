# Fix Pengembalian File Upload Error

## Information Gathered

- Backend `PengembalianController` handles file upload in the `create` method via `FileInterceptor` for 'bukti_foto', storing files in './uploads' and setting `createPengembalianDto.bukti_foto` to the URL.
- Frontend separately calls `uploadBuktiFoto` to `/upload` (which returns 404), then calls `createPengembalian` with the URL in JSON.
- Issue: `/upload` endpoint doesn't exist; need to send file directly with the create request as multipart form data.

## Plan

1. Modify `createPengembalian` in `src/app/services/pengembalian.ts`

   - Change function to accept a `File` parameter for bukti_foto
   - Create `FormData`, append the file as 'bukti_foto' and the data as JSON string under 'data'
   - Remove Content-Type header to let browser set multipart boundary

2. Remove `uploadBuktiFoto` function from `src/app/services/pengembalian.ts`

3. Update `src/app/pengembalian/ajukan/page.tsx`
   - Remove import of `uploadBuktiFoto`
   - Pass `buktiFotoFile` directly to `createPengembalian`
   - Remove separate upload step and adjust progress messages to reflect single submission

## Dependent Files

- src/app/services/pengembalian.ts
- src/app/pengembalian/ajukan/page.tsx

## Followup Steps

- Test the pengembalian submission to ensure file upload works
- Verify backend receives and processes the file correctly

## Progress

- [x] Modified `createPengembalian` to accept File parameter and use FormData
- [x] Removed `bukti_foto` from `CreatePengembalianDto`
- [x] Removed `uploadBuktiFoto` function
- [x] Updated `src/app/pengembalian/ajukan/page.tsx` to pass file directly and remove separate upload

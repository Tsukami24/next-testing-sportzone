# Forgot Password Feature Implementation

## Tasks
- [x] Add forgotPassword, verifyOtp, resetPassword functions to src/app/services/auth.ts
- [x] Modify src/app/login/page.tsx to add "Forgot Password?" link and modal
- [x] Implement modal with steps: email input, OTP input, new password input
- [x] Add error handling and success messages
- [x] Test the forgot password flow

# Add Phone Number to Register

## Tasks
- [x] Update registerUser in src/app/services/auth.ts to accept phone parameter and include it in the request body
- [x] Add phone input and state in src/app/login/page.tsx register form
- [x] Update handleRegister to pass phone to registerUser
- [x] Display phone in profile on src/app/home/page.tsx
- [ ] Test the register with phone and profile display

# TODO

<<<<<<< HEAD
- [ ] Fix corrupted `lib/auth.ts` (remove duplicate blocks + stray brace; make login/register work).
- [ ] Ensure auth flow matches existing routes: verify `/login`, `/register`, and `/auth/callback`.
- [ ] Fix “Sign in” and “Create account” button handlers after auth fix.
- [ ] Optionally rerun `npm run lint` to ensure build passes (there are other unrelated lint errors right now).
=======
## Auth troubleshooting + remove Supabase
- [x] Locate all remaining Supabase references and auth guard logic (cookie/session checks)
- [ ] Identify why login/register fail (localStorage persistence, cookie mismatch, redirect/guard)
- [ ] Remove Supabase connection code paths (lib/supabaseClient + test scripts)
- [ ] Ensure auth consistently uses the same cookies across login/register/guards
- [ ] Run `npm run lint` and `npm run build`
- [ ] Manual test: `/register` then `/login`, verify redirect to `/dashboard`

>>>>>>> 3e26547132126c075e46fffc19579da740bdea12


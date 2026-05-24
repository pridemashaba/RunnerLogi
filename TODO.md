# TODO

## Auth troubleshooting + remove Supabase
- [x] Locate all remaining Supabase references and auth guard logic (cookie/session checks)
- [ ] Identify why login/register fail (localStorage persistence, cookie mismatch, redirect/guard)
- [ ] Remove Supabase connection code paths (lib/supabaseClient + test scripts)
- [ ] Ensure auth consistently uses the same cookies across login/register/guards
- [ ] Run `npm run lint` and `npm run build`
- [ ] Manual test: `/register` then `/login`, verify redirect to `/dashboard`



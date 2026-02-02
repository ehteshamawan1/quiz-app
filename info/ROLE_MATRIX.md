# Role & Permission Matrix (Phase 1)

## Roles
- Admin: full platform access
- Educator: create/manage games and students in assigned institutions
- Student: play assigned games and view own results

## Permissions
| Capability | Admin | Educator | Student |
| --- | --- | --- | --- |
| Manage colleges | Yes | No | No |
| Manage users | Yes | No | No |
| Create/edit games | Yes | Yes | No |
| Assign games | Yes | Yes | No |
| View analytics (all) | Yes | No | No |
| View analytics (own classes) | Yes | Yes | No |
| Play games | Yes | Yes (preview) | Yes |
| Manage templates | Yes | No | No |

## Notes
- Enforcement is via JWT + role guard in API.
- Educators are scoped to their assigned institution(s) in Phase 2.
